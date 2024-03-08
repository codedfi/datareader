const path = require("path");
const fs = require("fs");
const { getClientIp } = require("./utils")

const setOrderLog = (params = {}, appSecret, req) => {
  try {
    const certHash = params.certHash || "";
    if (certHash) {
      const clientIp = getClientIp(req)
      const tempRow = `${new Date().getTime()} | ${appSecret} | ${certHash} | ${JSON.stringify(
        params
      )} | ${clientIp} \n`;
      const filePath = path.resolve(__dirname, "../log/crossChainRequest.txt");
      const whirtFile = () => {
        fs.appendFile(filePath, tempRow, () => {});
      };
      fs.open(filePath, "wx", (err, fd) => {
        if (err) {
          if (err.code === "EEXIST") {
            whirtFile();
            return;
          }
          throw err;
        }
        whirtFile();
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getOrderLog = () => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.resolve(__dirname, '../log', "crossChainRequest.txt");
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) throw err;
        const recordList = data.split("\n");
        const formatData = {};
        recordList.forEach((item) => {
          if (item) {
            const [date, appSecret, hash, params, clientIp] = item.split(" | ");
            const tempItem = [new Date(+date), clientIp, JSON.parse(params)];
            const keys = Object.keys(formatData);
            if (keys.includes(appSecret)) {
              formatData[appSecret][hash] = tempItem;
            } else {
              formatData[appSecret] = {
                [hash]: tempItem,
              };
            }
          }
        });
        const filePath = path.resolve(__dirname, '../log', "crossChainRequest.json");
        fs.writeFileSync(filePath, JSON.stringify(formatData))
        resolve(filePath)
      });
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = {
  setOrderLog,
  getOrderLog,
};
