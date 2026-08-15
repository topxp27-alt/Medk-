const apps = {
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  netflix: "https://www.netflix.com/"
};

export function getCapabilities() {
  return {
    voice: true,
    imageUpload: true,
    commandRouter: true,
    appLinks: true,
    youtubeCreator: true,
    officialPublishingAdapter: true,
    instagramPublishingAdapter: true,
    arbitraryDmAutomation: false
  };
}

export async function buildCommandResponse(command) {
  const c = command.trim();
  const x = c.toLowerCase();

  if (!c) {
    return {
      ok: false,
      message: "Say or type a command."
    };
  }

  for (const name of Object.keys(apps)) {
    if (x.includes(name)) {
      return {
        ok: true,
        action: "open_url",
        target: name,
        url: apps[name],
        message: `Opening ${name}.`
      };
    }
  }

  if (x.includes("test")) {
    return {
      ok: true,
      action: "test",
      message: "System test started."
    };
  }

  if (
    x.includes("youtube") &&
    (
      x.includes("video") ||
      x.includes("make") ||
      x.includes("create")
    )
  ) {
    return {
      ok: true,
      action: "video_creator",
      message:
        "Opening the YouTube creator workflow."
    };
  }

  return {
    ok: true,
    action: "chat",
    message:
      `I understood: “${c}”. Connect an AI provider in .env for full natural-language reasoning.`
  };
}
