import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, () => {
    console.log(
        `QuantPulse backend running on port ${PORT}`
    );
});