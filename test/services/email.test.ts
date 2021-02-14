import { sendEmail } from "../../src/emailer";

// Test sending emails
test("Email", async () => {
  // To test this, fill in an email address to send to below.
  const address = "";
  const subject = "Test email subject line";
  const html = "<h1>HTML Content</h1><p>Hello, email!</p>";
  const text = "Text Content\n\nHello, email!";

  if (address) {
    await sendEmail(address, subject, html, text);
  }
});
