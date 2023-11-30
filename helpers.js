const API = "https://laravel-showroom-api.vercel.app/api/profile/room";

const roomIds = [
  317738, 318117, 318118, 318204, 318207, 318208, 318209, 318222, 318223,
  318224, 318225, 318228, 318232, 318227, 318230, 318112, 318218, 318210,
  317727, 318239, 318233, 400710, 400713, 400714, 400715, 400716, 400717,
  400718, 461451, 461452, 461454, 461458, 461463, 461475, 461466, 461465,
  461478, 461479, 461476, 461480, 461481,
];

const getImageSetlist = (name) => {
  if (name === "Cara Meminum Ramune") {
    return "https://media.discordapp.net/attachments/1108380195175551047/1169569783528833074/a0d68478-a16a-4b8b-a722-d1a2027bd5d8-transformed_1.jpeg?ex=6555e1bd&is=65436cbd&hm=2913d772f62f381bf42e62c640e1062d48734049f40b67402fa89e89b0019571&=&width=950&height=607";
  } else if (name === "Aturan Anti Cinta") {
    return "https://s-light.tiket.photos/t/01E25EBZS3W0FY9GTG6C42E1SE/rsfit19201280gsm/events/2021/04/05/c7976999-b028-405f-948b-9777afc8a629-1617593375345-ca8626d0ba97c53fe6777313e9bab23f.jpg";
  } else if (name === "Tunas di Balik Seragam") {
    return "https://i1.sndcdn.com/artworks-47fDUWFcsadWdQx1-fMUYzA-t500x500.jpg";
  } else if (name === "Pajama Drive") {
    return "https://pbs.twimg.com/media/FhmwTYKVsAA5nFf.jpg";
  } else if (name === "Ingin Bertemu") {
    return "https://pbs.twimg.com/media/FvYFXbjaAAITstl?format=jpg&name=4096x4096";
  } else if (name === "11th Anniversary Event") {
    return "https://media.discordapp.net/attachments/692366353939824650/1150075998579216467/Screenshot_2023-09-09-21-30-39-62.png?width=416&height=607";
  }
};

module.exports = { API, roomIds, getImageSetlist };
