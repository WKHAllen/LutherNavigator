import mainDB from "./util";

// Index page services
export module IndexServices {
  // Get the index page message
  export async function getMessage(): Promise<string> {
    const rows = await mainDB.execute("SELECT message FROM Main;");
    return rows[0].message;
  }
}
