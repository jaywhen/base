const Promis = require("../promise.js");

module.exports = {
  deferred: function () {
    let resolve, reject;
    const promise = new Promis((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {
      promise,
      resolve,
      reject,
    };
  },
};
