// src/controllers/utilsController.js

exports.calculateBitrate = (req, res) => {
    const { duration, fileSize, resolution, fps } = req.body;

    if (!duration) {
        return res.status(400).json({ message: "Duration (in seconds) is required." });
    }

    const results = {
        input: { duration, fileSize, resolution, fps },
        calculations: [],
        assumptions: []
    };

    // --- Scenario A: File Size Known ---
    if (fileSize) {
        // Logic: (Size in MB * 8 * 1024) / Duration = Kbps
        // 1 MB = 8 Megabits = 8192 Kilobits
        const totalKilobits = fileSize * 8192;
        const bitrateKbps = Math.round(totalKilobits / duration);
        const bitrateMbps = (bitrateKbps / 1000).toFixed(2);

        results.calculations.push({
            type: "File Size Based",
            bitrateKbps: bitrateKbps,
            bitrateMbps: bitrateMbps,
            note: "Actual average bitrate required to match this file size."
        });

        results.assumptions.push("Calculation includes both video and audio tracks combined.");
    }

    // --- Scenario B: Resolution & FPS Target ---
    if (resolution) {
        let recommendedMbps = 0;
        let quality = "Standard";

        // Simple Lookup Table (Youtube/Twitch Guidelines)
        const target = `${resolution}@${fps || 30}`;

        switch (resolution.toLowerCase()) {
            case '4k':
            case '2160p':
                recommendedMbps = (fps > 30) ? 60 : 40;
                break;
            case '1440p':
            case '2k':
                recommendedMbps = (fps > 30) ? 24 : 16;
                break;
            case '1080p':
                recommendedMbps = (fps > 30) ? 12 : 8;
                break;
            case '720p':
                recommendedMbps = (fps > 30) ? 7.5 : 5;
                break;
            case '480p':
                recommendedMbps = 2.5;
                break;
            default:
                recommendedMbps = 0;
        }

        if (recommendedMbps > 0) {
            const highMotionMbps = Math.ceil(recommendedMbps * 1.5);
            const estimatedSizeStandard = ((recommendedMbps * duration) / 8).toFixed(2); // Mbps -> MB
            const estimatedSizeHigh = ((highMotionMbps * duration) / 8).toFixed(2);

            results.calculations.push({
                type: "Streaming Target (Standard)",
                bitrateMbps: recommendedMbps,
                estimatedFileSizeMB: estimatedSizeStandard,
                note: `Recommended for ${resolution} at ${fps || 30}fps (Standard Content)`
            });

            results.calculations.push({
                type: "Streaming Target (High Motion)",
                bitrateMbps: highMotionMbps,
                estimatedFileSizeMB: estimatedSizeHigh,
                note: `Recommended for ${resolution} at ${fps || 30}fps (Gaming/Sports)`
            });

            results.assumptions.push("Based on standard H.264 streaming guidelines.");
        }
    }

    if (results.calculations.length === 0) {
        return res.status(400).json({
            message: "Please provide either 'fileSize' (MB) OR 'resolution' (e.g. 1080p) to calculate."
        });
    }

    res.status(200).json(results);
};
