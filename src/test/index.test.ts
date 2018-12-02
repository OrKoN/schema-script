import { App } from "../app";

test("app runs on the examples folder", async () => {
  const app = new App("./examples");
  await app.run();
});
