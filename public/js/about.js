import { element } from "./tools.js";

const data_url = "../data/about.json";

const icons = {
  organization: "../assets/building.png",
  location: "../assets/location-pin.png",
  dates: "../assets/calendar.png",
};

function info(className, iconKey, text) {
  const p = element("p", className);
  const icon = element("img");
  icon.src = icons[iconKey];
  icon.alt = "";
  p.append(icon, text);
  return p;
}

function renderEntries(container, section, entryClass, organizationClass) {
  container.append(element("h1", "", section.title));

  section.items.forEach((item, index) => {
    const article = element("article", entryClass);
    article.append(
      element("h2", "", item.title),
      info(organizationClass, "organization", item.organization),
      element("p", "status", item.type),
      info("location", "location", item.location),
      info("dates", "dates", `${item.start} - ${item.end ?? "Present"}`)
    );
    container.append(article);

    if (index < section.items.length - 1) {
      container.append(element("hr", "divider"));
    }
  });
}

function render(data) {
  const about = document.querySelector("#about");
  about.append(element("h1", "", data.about.title), element("p", "", data.about.text));

  renderEntries(
    document.querySelector("#work-experience"),
    data.workExperience,
    "job",
    "company"
  );
  renderEntries(
    document.querySelector("#education"),
    data.education,
    "program",
    "school"
  );
}

export async function initAboutPage() {
  try {
    const response = await fetch(data_url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when loading ${response.url}`);
    }
    render(await response.json());
  } catch (error) {
    console.error("Could not load the about data:", error);
    document
      .querySelector("main")
      .replaceChildren(element("p", "error", "Sorry, this content could not be loaded."));
  }
}