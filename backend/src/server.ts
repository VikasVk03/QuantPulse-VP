import app from "./app.js";
import { config } from "./config/env.js";

app.listen(config.port, () => {
    console.log(
        `QuantPulse backend running on port ${config.port}`
    );
});
