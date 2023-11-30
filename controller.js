const axios = require("axios");
const cheerio = require("cheerio");
const { roomIds, getImageSetlist } = require("./helpers");

exports.getMostWatchRoom = async (req, res) => {
  try {
    const { token } = req.body;
    const promises = Object.values(roomIds).map(async (room_id) => {
      const response = await axios.get(
        `https://www.showroom-live.com/api/room/profile?room_id=${room_id}`,
        {
          headers: {
            Cookie: token || "",
          },
        }
      );

      return response.data;
    });

    const roomData = await Promise.all(promises);

    const mostVisitRoom = roomData
      .map((item) => ({
        name: item.room_url_key ? item.room_url_key.replace("JKT48_", "") : "",
        image: item.image_square
          ? item.image_square.replace("_m.jpeg", "_l.jpeg")
          : "",
        visit: item.visit_count || 0,
      }))
      .sort((a, b) => b.visit - a.visit);

    res.send(mostVisitRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const convertRupiah = (value = 0) => {
  if (value === null) {
    value = 0;
  }
  const rupiah = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
  return `Rp ${rupiah}`;
};

exports.getPremiumLiveHistory = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.showroom-live.com/paid_live/hist",
      {
        headers: {
          Cookie: req.body.token,
        },
      }
    );
    const $ = cheerio.load(response.data);
    const results = [];

    const name = $(".pc-header-mypage-name")
      .text()
      .replace(/^\s+|\s+$/g, "");
    const image = $(".pc-header-mypage-image").attr("src");
    const level = $(".pc-header-mypage-level")
      .text()
      .replace(/^\s+|\s+$/g, "");

    $(".paid-live-schedule").each((index, element) => {
      const title = $(element).find(".paid-live-title a").text().trim();
      const link = $(element).find(".paid-live-title a").attr("href");
      const price = $(element)
        .find(".paid-live-info-default-price .paid-live-info-item-value")
        .text()
        .trim();

      results.push({
        title: title,
        link: link,
        price: price,
      });
    });

    let totalPrice = 0;
    const exchangeRate = 10.4;

    results.map((item) => {
      return (totalPrice += parseInt(item.price.replace(" JPY", "")));
    });

    const filterShowTheater = (title) => {
      const show = results
        .map((item) => {
          if (item.title.includes(title)) {
            return item;
          }
        })
        .filter(Boolean);

      return show;
    };

    const shows = [
      "Cara Meminum Ramune",
      "Aturan Anti Cinta",
      "Ingin Bertemu",
      "Tunas di Balik Seragam",
      "Banzai",
      "Pajama Drive",
      "11th Anniversary Event",
    ];

    const showInfo = shows
      .map((show) => ({
        name: show,
        total: filterShowTheater(show).length,
      }))
      .sort((a, b) => b.total - a.total);

    const topSetlist =
      results.length !== 0
        ? getImageSetlist(showInfo[0].name)
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/JKT48.svg/1200px-JKT48.svg.png";

    res.json({
      user: {
        name,
        image,
        level,
      },
      totalPaidLive: results.length,
      totalJPY: totalPrice,
      totalIDR: convertRupiah(`${totalPrice * exchangeRate}0`),
      topSetlist,
      show: results.length !== 0 ? showInfo : [],
      results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
