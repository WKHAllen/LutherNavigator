import mainDB from "./util";

// Index page services
export module IndexServices {
  // Get the index page message
  export async function getMessage(): Promise<string> {
    return "Hello, world!";
  }
}
