const $ = s => document.querySelector(s);

const chat = $("#chat");
const orb = $("#orb");
const state = $("#state");
const hint = $("#hint");


function add(text, user = false) {

  const d = document.createElement("div");

  d.className =
    "msg" +
    (user ? " user" : "");

  d.textContent = text;

  chat.appendChild(d);

  chat.scrollTop =
    chat.scrollHeight;
}


function busy(on, text = "THINKING") {

  orb.classList.toggle(
    "active",
    on
  );

  state.textContent =
    on ? text : "READY";

  hint.textContent =
    on
      ? "TopX is processing your request…"
      : "Talk to TopX or type a command";
}


async function command(c) {

  c = c.trim();

  if (!c) return;

  add(c, true);

  $("#cmd").value = "";

  busy(true);

  try {

    const r = await fetch(
      "/api/command",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          command: c
        })
      }
    );

    const x = await r.json();

    busy(false);

    add(
      x.message ||
      x.error
    );

    if (
      x.action ===
      "open_url"
    ) {
      window.open(
        x.url,
        "_blank"
      );
    }

    if (
      x.action === "test"
    ) {
      openTests();
    }

    if (
      x.action ===
      "video_creator"
    ) {
      openCreator();
    }

    say(
      x.message ||
      ""
    );

  } catch (e) {

    busy(false);

    add(
      "TopX backend is unavailable."
    );
  }
}


function say(text) {

  if (
    "speechSynthesis"
    in window
  ) {

    speechSynthesis.cancel();

    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        text
      )
    );
  }
}


$("#send").onclick =
  () => command(
    $("#cmd").value
  );


$("#cmd").onkeydown =
  e => {

    if (
      e.key === "Enter"
    ) {
      command(
        $("#cmd").value
      );
    }

  };


document
  .querySelectorAll(
    "[data-c]"
  )
  .forEach(
    b =>
      b.onclick =
        () =>
          command(
            b.dataset.c
          )
  );


let rec;

const SR =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


if (SR) {

  rec = new SR();

  rec.lang =
    "en-US";

  rec.onstart =
    () =>
      busy(
        true,
        "LISTENING"
      );

  rec.onresult =
    e =>
      command(
        e.results[0][0]
          .transcript
      );

  rec.onend =
    () =>
      busy(false);

}


$("#mic").onclick =
  () => {

    if (rec) {

      rec.start();

    } else {

      add(
        "Voice recognition is not supported by this browser."
      );

    }

  };


function openTests() {

  $("#panel")
    .classList
    .remove("hidden");

  fetch(
    "/api/capabilities"
  )
    .then(
      r => r.json()
    )
    .then(
      c => {

        $("#tests").innerHTML =
          Object.entries(c)
            .map(
              ([k, v]) => `
                <div class="test">
                  <span>${k}</span>
                  <b class="${
                    v === true
                      ? "ok"
                      : "warn"
                  }">
                    ${
                      v === true
                        ? "READY"
                        : v === false
                          ? "BLOCKED"
                          : "AVAILABLE"
                    }
                  </b>
                </div>
              `
            )
            .join("");

      }
    );
}


$("#test").onclick =
  openTests;


$("#close").onclick =
  () =>
    $("#panel")
      .classList
      .add("hidden");


function openCreator() {

  $("#creatorPanel")
    .classList
    .remove("hidden");
}


$("#creator").onclick =
  openCreator;


$("#closeCreator").onclick =
  () =>
    $("#creatorPanel")
      .classList
      .add("hidden");


$("#makePlan").onclick =
  async () => {

    const topic =
      $("#topic")
        .value
        .trim();

    if (!topic) return;

    const r =
      await fetch(
        "/api/video-plan",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              topic
            })
        }
      );

    const x =
      await r.json();

    $("#plan")
      .textContent =
        JSON.stringify(
          x.plan,
          null,
          2
        );

  };


$("#publish").onclick =
  async () => {

    const r =
      await fetch(
        "/api/publish",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: "{}"
        }
      );

    const x =
      await r.json();

    $("#plan")
      .textContent =
        x.message ||
        "Not connected.";

  };


$("#imageBtn").onclick =
  () =>
    $("#image").click();


$("#image").onchange =
  async () => {

    if (
      !$("#image").files[0]
    ) return;

    busy(
      true,
      "ANALYZING"
    );

    const f =
      new FormData();

    f.append(
      "image",
      $("#image").files[0]
    );

    const r =
      await fetch(
        "/api/image",
        {
          method: "POST",
          body: f
        }
      );

    const x =
      await r.json();

    busy(false);

    add(
      x.message ||
      x.error
    );

  };


add(
  "TopX is online. Voice, commands, app links, image upload, testing and the creator workflow are ready."
);
