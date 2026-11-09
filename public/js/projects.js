import { element, safeUrl } from "./tools.js";


const Github_Username = "rauldel7";

const Github_URL = `https://api.github.com/users/${Github_Username}/repos?sort=updated&per_page=100`;
const Own_Projects_URL = "../data/projects.json";
const Hide_Forks = true;

function loadingState(message) {
    const box = element("div", "status loading");
    box.setAttribute("role", "status");
    box.append(element("span", "spinner"), element("span", "", message));
    return box;
}

function errorState(message, onRetry) {
    const box = element("div", "status error");
    box.setAttribute("role", "alert");
    const retry = element("button", "retry-button", "Try again");
    retry.type = "button";
    retry.addEventListener("click", onRetry);
    box.append(element("p", "", message), retry);
    return box;
}

async function fetchGitHubRepos() {
  let response;
  try {
    response = await fetch(Github_URL);
  } catch {
    throw new Error("Couldn't reach GitHub. Check your internet connection and try again.");
  } 

  if (response.status === 404) {
    throw new Error(`The Github user "${Github_Username}" was not found.`);
  }

  if (response.status === 403) {
    throw new Error("GitHub's request limit has been reached. Please try again in a little while.");
  }

  if (response.status === 429) {
    throw new Error("GitHub's request limit has been reached. Please try again in a little while.");
  }

  if (!response.ok) {
    throw new Error(`Github responded with an error (${response.status}). Please try again later.`)
  }

  return response.json();
}

async function fetchOwnProjects() {
    let response;
    try {
        response = await fetch(Own_Projects_URL)
    } catch {
        throw new Error("Couldn't load the featured projects.");
    }
    if (!response.ok) {
        throw new Error(`Couldn't load the featured projects (${response.status}).`);
    }
    const data = await response.json();
    return data.projects ?? [];
}

function imagePlaceholder(title) {
  const box = element("div", "project-image project-image--placeholder");
  box.setAttribute("aria-hidden", "true");
  box.append(element("span", "", title.charAt(0).toUpperCase()));
  return box;
}

function projectImage(title, image, alt) {
  if (!image) return imagePlaceholder(title);
  const img = element("img", "project-image");
  img.src = image;
  img.alt = alt ?? `Screenshot of ${title}`;
  img.loading = "lazy";
  img.addEventListener("error", () => img.replaceWith(imagePlaceholder(title)));
  return img;
}

function projectLink(label, url, kind) {
  const href = safeUrl(url);
  if (!href) return null;
  const a = element("a", `project-link project-link--${kind}`, label);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

function projectCard({ title, description, image, alt, techStack = [], liveUrl, codeUrl }) {
  const card = element("article", "project-card");
  const body = element("div", "project-body");
 
  body.append(
    element("h3", "", title),
    element("p", "project-description", description || "No description provided.")
  );

  if (techStack.length > 0) {
    const stack = element("p", "project-stack");
    stack.append(element("strong", "", "Tech stack: "), techStack.join(", "));
    body.append(stack);
  }

  const footer = element("div", "project-footer");
  const live = projectLink("Live Preview", liveUrl, "live");
  const code = projectLink("View Code", codeUrl, "code");
  if (live) footer.append(live);
  if (code) footer.append(code);
  if (footer.children.length > 0) body.append(footer);
 
  card.append(projectImage(title, image, alt), body);
  return card;
}
 
function repoToCard(repo) {
  return projectCard({
    title: repo.name,
    description: repo.description,
    techStack: [...new Set([repo.language, ...(repo.topics ?? [])].filter(Boolean))],
    liveUrl: repo.homepage,
    codeUrl: repo.html_url,
  });
}

export async function initProjectsPage() {
  const featuredSection = document.querySelector("#featured");
  const featuredList = document.querySelector("#featured-list");
  const githubList = document.querySelector("#github-list");

  featuredSection.hidden = false;
  featuredList.replaceChildren(loadingState("Loading featured projects…"));
  githubList.replaceChildren(loadingState("Loading projects from GitHub…"));

  const [ownResult, reposResult] = await Promise.allSettled([
    fetchOwnProjects(),
    fetchGitHubRepos(),
  ]);

  let featuredRepoNames = [];
  if (ownResult.status === "fulfilled") {
    const own = ownResult.value;
    if (own.length === 0) {
      featuredSection.hidden = true;
    } else {
      featuredList.replaceChildren(...own.map(projectCard));
      featuredRepoNames = own.map((p) => p.repo?.toLowerCase()).filter(Boolean);
    }
  } else {
    console.error(ownResult.reason);
    featuredList.replaceChildren(errorState(ownResult.reason.message, initProjectsPage));
  }
  
  if (reposResult.status === "fulfilled") {
    const repos = reposResult.value.filter(
      (repo) =>
        (!Hide_Forks || !repo.fork) &&
        !featuredRepoNames.includes(repo.name.toLowerCase())
    );

    if (repos.length === 0) {
      githubList.replaceChildren(element("p", "status", "No public repositories to show yet."));
    } else {
      githubList.replaceChildren(...repos.map(repoToCard));
    }
  } else {
    console.error(reposResult.reason);
    githubList.replaceChildren(errorState(reposResult.reason.message, initProjectsPage));
  }
}