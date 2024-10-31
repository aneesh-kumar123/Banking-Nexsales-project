class Logger {
  static info(value) {
    //write log into a file
    console.log(`##-----${value}-------##`);
  }
  static error(value) {
    console.log(`##------${value}------##`);
  }
}
module.exports = Logger;