require.extensions[".css"] = function(m, filename) {
  let link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", filename);
  document.head.appendChild(link);
};
