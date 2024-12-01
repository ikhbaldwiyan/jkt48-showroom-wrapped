const axios = require("axios");
const cheerio = require("cheerio");
const { getImageSetlist, getImageBase64, roomTrainee } = require("./helpers");
const roomData2024 = require("./data.json"); // Load your JSON file

exports.getMostWatchRoom = async (req, res) => {
  try {
    const { token } = req.body;

    // Limit concurrent requests to prevent overwhelming the API
    const CONCURRENT_LIMIT = 5;
    const roomChunks = [];

    // Split roomData2024 into chunks for controlled concurrent processing
    for (let i = 0; i < roomData2024.length; i += CONCURRENT_LIMIT) {
      roomChunks.push(roomData2024.slice(i, i + CONCURRENT_LIMIT));
    }

    const allRoomData = [];

    // Process room data in controlled batches
    for (const chunk of roomChunks) {
      const chunkPromises = chunk.map(async (data) => {
        const room_id = data?.room_id;
        try {
          // Use axios cancelToken for timeout protection
          const source = axios.CancelToken.source();
          const timeoutId = setTimeout(() => {
            source.cancel(`Request for room_id ${room_id} timed out`);
          }, 3000); // 3 seconds timeout

          const response = await axios.get(
            `https://www.showroom-live.com/api/room/profile?room_id=${room_id}`,
            {
              headers: {
                Cookie: token || ""
              },
              cancelToken: source.token
            }
          );

          clearTimeout(timeoutId);

          const base64Image = await getImageBase64(response?.data?.image);

          return {
            room_id: response?.data?.room_id,
            name: data?.full_name,
            image: base64Image,
            total_live_member: data?.total_live?.sr_count,
            all_visit: response?.data?.visit_count
          };
        } catch (error) {
          console.error(
            `Error fetching room data for room_id ${room_id}:`,
            error.message
          );
          return null;
        }
      });

      // Wait for chunk to complete before moving to next
      const chunkResults = await Promise.all(chunkPromises);
      allRoomData.push(...chunkResults.filter(Boolean));
    }

    // Memoize trainee room calculation to avoid repeated checks
    const isTraineeRoom = new Set(roomTrainee);

    const processedRoomData = allRoomData.map((room) => {
      if (isTraineeRoom.has(room.room_id)) {
        return {
          ...room,
          visit_2024: room.all_visit,
        };
      }

      const engagementRatio =
        room.total_live_member > 0
          ? Math.min(1, room.all_visit / (room.total_live_member * 4))
          : 0;

      const visit_2024 = Math.min(
        Math.ceil(room.total_live_member * engagementRatio),
        room.total_live_member
      );

      return {
        ...room,
        visit_2024
      };
    });

    processedRoomData.sort((a, b) => b.visit_2024 - a.visit_2024);

    res.json(processedRoomData);
  } catch (error) {
    console.error("Error in getMostWatchRoomFor2024:", error);
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

    const userImage = await getImageBase64(image);

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
      "Pajama",
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
        image: userImage,
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
