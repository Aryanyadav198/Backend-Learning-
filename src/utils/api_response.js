class ApiResponse {
  constructor(statusCode, message, data = {}) {
    this.success = statusCode < 400;
    // this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
export { ApiResponse };