/*
 * @license: Apache-2.0 license
 * @license_url: https://github.com/TBD54566975/incubation-wallet-rendering/blob/main/LICENSE
 * @title: Wallet Rendering Library
 * @fileoverview: Library for wallet rendering specification on DIF to render suggestions to users.
 * @repository_url: https://github.com/TBD54566975/incubation-wallet-rendering
 * @maintainers: andor@benri.io
 * @description: This library is a flexible and vanilla js implementation of
 *    the specifications done at the Decentralized Identity Foundation provided at
 *    https://identity.foundation/wallet-rendering/
 *
 *    It specifies how an issuer of Verifiable Credentials can make generic,
 *    high-level rendering suggestions to wallets and consumers of the credentials,
 *    working on the model of "style guides" for other credential formats
 * @usage: To use please follow the following steps:
 *    1. add this library to your application
 *    2. invoke the walletRender global function. i.e
 *    document.getElementById("viz").walletRender({
 *      data: dataobj,
 *    })
 * @acknowledgments: This implementation was heavily inspired by:
 *    https://github.com/jsonform/jsonform/blob/master/lib/jsonform.js
 */

/*
 * Generates a HTML wallet render given the JSON object and renders
 * the credential
 *
 * Main entry point of the library. Defined as a jQuery function that typically
 * needs to be applied to a <div> element in the document.
 *
 * The function handles the following properties for the rendering object it
 * receives as parameter:
 *
 * - schema (optional): The JSON Schema that describes the credential to render.
 * set this to override the default schemas compliant with the decentralized identity foundation
 * spec.
 * - data (required) : The object data to be rendered
 * - validate: Validates the data along the schema. Uses the value
 * of the "validate" property as validator if it is an object.
 * - displayErrors: Function to call with errors upon submission.
 *  Default is to not render credential and to render error if exists.
 *
 * @function
 * @param {Object} options The Wallet Rendering object to use as basis for the render
 */

const VERSION = "https://identity.foundation/credential-manifest/spec/v1.0.0/";

const STYLE = `
.descriptor {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	position: relative;
	max-width: min(100%, calc(var(--hero-width, 100%) * 1px));
	max-height: min(100%, calc(var(--hero-height, 100%) * 1px));
	aspect-ratio: var(--hero-width, 1) / var(--hero-height, 1);
	padding: 1em;
}
.thumbnail {
	position: absolute;
	top: 1em;
	left: 1em;
	z-index: 2;
	max-width: 32px;
	max-height: 32px;
}
.hero {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1;
	max-width: 100%;
	max-height: 100%;
}
.title {
	position: relative;
	z-index: 3;
	margin: 0;
	padding: 0;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.subtitle {
	position: relative;
	z-index: 3;
	margin: 0;
	padding: 0;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.description {
	position: relative;
	z-index: 3;
	margin: 0;
	padding: 0.5em 0 0;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.properties {
	position: relative;
	z-index: 3;
	margin: 0;
	padding: 0.5em 0 0;
}
.property {
	list-style-type: none;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}
.property::before {
	margin: 0 0.3em 0 0.5em;
	content: "\\2022";
}
`;

function isURL(string) {
  try {
    new URL(string);
  } catch {
    return false;
  }
  return true;
}

function verifyType(value, typeOrValidator) {
  if (typeof typeOrValidator === "string" && typeof value !== typeOrValidator)
    return undefined;
  if (typeof typeOrValidator === "function" && !typeOrValidator(value))
    return undefined;
  return value;
}

function isHexColor(value) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

class VerifiableCredential extends HTMLElement {
  static #style = null;

  #data = null;
  #srcFetchAbortController = null;

  #manifest = null;
  #manifestFetchAbortController = null;

  #root;
  constructor() {
    super();

    this.#root = this.attachShadow({ mode: "closed" });

    if (!VerifiableCredential.#style) {
      VerifiableCredential.#style = new CSSStyleSheet();
      VerifiableCredential.#style.replaceSync(STYLE);
    }
    this.#root.adoptedStyleSheets = [VerifiableCredential.#style];
    console.log("made credential in constructor", this);
  }

  get src() {
    return this.getAttribute("src");
  }
  set src(src) {
    if (typeof src === "string") this.setAttribute("src", src);
  }

  get data() {
    return this.#data;
  }
  set data(data) {
    if (typeof data !== "object" || data !== undefined) return;

    if (this.#srcFetchAbortController) {
      this.#srcFetchAbortController.abort();
      this.#srcFetchAbortController = null;
    }

    this.#data = data;
    this.#update();
  }

  get manifest() {
    return this.#manifest;
  }
  set manifest(manifest) {
    if (typeof manifest === "string") {
      this.setAttribute("manifest", manifest);
      return;
    }

    if (typeof manifest !== "object" || manifest !== undefined) return;

    if (this.#manifestFetchAbortController) {
      this.#manifestFetchAbortController.abort();
      this.#manifestFetchAbortController = null;
    }

    this.#manifest = manifest;
    this.#update();
  }

  static observedAttributes = ["src", "manifest"];
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "src":
        this.#srcFetchAbortController?.abort();
        this.#srcFetchAbortController = new AbortController();

        fetch(newValue, { signal: this.#srcFetchAbortController.signal })
          .then((response) => response.json())
          .then((json) => {
            this.data = json;
          })
          .catch((error) => {
            if (error.name !== "AbortError") throw error; // surface `fetch` errors for developers
          });
        return;

      case "manifest":
        this.#manifestFetchAbortController?.abort();
        this.#manifestFetchAbortController = new AbortController();

        fetch(newValue, { signal: this.#manifestFetchAbortController.signal })
          .then((response) => response.json())
          .then((json) => {
            this.manifest = json;
          })
          .catch((error) => {
            if (error.name !== "AbortError") throw error; // surface `fetch` errors for developers
          });
        return;
    }
  }

  #update() {
    this.#root.textContent = ""; // remove all children

    if (!this.#data || typeof this.#data !== "object") return;

    if (!this.#manifest || typeof this.#manifest !== "object") return;

    // <https://identity.foundation/credential-manifest/#versioning>
    if (this.#manifest["spec_version"] !== VERSION) return;

    // <https://identity.foundation/credential-manifest/#output-descriptor>
    let descriptors =
      verifyType(this.#manifest["output_descriptors"], Array.isArray) ?? [];
    for (let descriptor of descriptors) {
      if (!descriptor) continue;

      // <https://identity.foundation/wallet-rendering/#entity-styles>

      let descriptorStyle = "";

      let textColor = verifyType(
        descriptor["styles"]?.["text"]?.["color"],
        isHexColor
      );
      if (textColor) descriptorStyle += `color:${textColor};`;

      let backgroundColor = verifyType(
        descriptor["styles"]?.["background"]?.["color"],
        isHexColor
      );
      if (backgroundColor)
        descriptorStyle += `background-color:${backgroundColor};`;

      let descriptorElement = this.#root.appendChild(
        document.createElement("section")
      );
      descriptorElement.classList.add("descriptor");
      if (descriptorStyle) descriptorElement.style = descriptorStyle;

      let thumbnailURI = verifyType(
        descriptor["styles"]?.["thumbnail"]?.["uri"],
        "string"
      );
      if (isURL(thumbnailURI)) {
        let thumbnailElement = descriptorElement.appendChild(
          document.createElement("img")
        );
        thumbnailElement.classList.add("thumbnail");
        thumbnailElement.src = thumbnailURI;
        thumbnailElement.hidden = true;
        thumbnailElement.addEventListener(
          "load",
          this.#handleThumbnailLoad.bind(this)
        );
        thumbnailElement.addEventListener(
          "error",
          this.#handleImageError.bind(this)
        );

        let thumbnailAlt = verifyType(
          descriptor["styles"]?.["thumbnail"]?.["alt"],
          "string"
        );
        if (thumbnailAlt) thumbnailElement.alt = thumbnailAlt;
      }

      let heroURI = verifyType(
        descriptor["styles"]?.["hero"]?.["uri"],
        "string"
      );
      if (isURL(heroURI)) {
        let heroElement = descriptorElement.appendChild(
          document.createElement("img")
        );
        heroElement.classList.add("hero");
        heroElement.src = heroURI;
        heroElement.hidden = true;
        heroElement.addEventListener("load", this.#handleHeroLoad.bind(this));
        heroElement.addEventListener(
          "error",
          this.#handleImageError.bind(this)
        );

        let heroAlt = verifyType(
          descriptor["styles"]?.["hero"]?.["alt"],
          "string"
        );
        if (heroAlt) heroElement.alt = heroAlt;
      }

      // <https://identity.foundation/wallet-rendering/#data-display>

      let title = this.#resolveDisplayMappingObject(
        descriptor["display"]?.["title"]
      );
      if (title) {
        let titleElement = descriptorElement.appendChild(
          document.createElement("h1")
        );
        titleElement.classList.add("title");
        titleElement.textContent = title;
      }

      let subtitle = this.#resolveDisplayMappingObject(
        descriptor["display"]?.["subtitle"]
      );
      if (subtitle) {
        let subtitleElement = descriptorElement.appendChild(
          document.createElement("h2")
        );
        subtitleElement.classList.add("subtitle");
        subtitleElement.textContent = subtitle;
      }

      let description = this.#resolveDisplayMappingObject(
        descriptor["display"]?.["description"]
      );
      if (description) {
        let descriptionElement = descriptorElement.appendChild(
          document.createElement("p")
        );
        descriptionElement.classList.add("description");
        descriptionElement.textContent = description;
      }

      let propertiesElement = descriptorElement.appendChild(
        document.createElement("ul")
      );
      propertiesElement.classList.add("properties");

      let properties =
        verifyType(descriptor["display"]?.["properties"], Array.isArray) ?? [];
      for (let property of properties) {
        if (!property) continue;

        let propertyElement = propertiesElement.appendChild(
          document.createElement("li")
        );
        propertyElement.classList.add("property");

        // <https://identity.foundation/wallet-rendering/#labeled-display-mapping-object>
        let label = verifyType(property["label"], "string");
        if (label) {
          let labelElement = propertyElement.appendChild(
            document.createElement("span")
          );
          labelElement.classList.add("label");
          labelElement.textContent = label;
        }

        let value = this.#resolveDisplayMappingObject(property);
        if (value) {
          let valueElement = propertyElement.appendChild(
            document.createElement("span")
          );
          valueElement.classList.add("value");
          valueElement.textContent = value;
        }
      }
    }
  }

  // <https://identity.foundation/wallet-rendering/#display-mapping-object>
  #resolveDisplayMappingObject(descriptor) {
    // <https://identity.foundation/wallet-rendering/#using-text>
    if ("text" in descriptor) return verifyType(descriptor["text"], "string");

    // <https://identity.foundation/wallet-rendering/#using-path>
    if ("path" in descriptor) {
      let fallback = verifyType(descriptor["fallback"], "string");

      let path = verifyType(descriptor["path"], Array.isArray);
      if (path === undefined) return fallback;

      let value = this.#getFirstValueMatchingPaths(path);
      if (value === undefined) return fallback;

      let schema = descriptor["schema"];
      try {
        if (!new AJV().validate(schema, value)) return fallback;
      } catch {
        return fallback;
      }

      return this.#formatValue(value);
    }

    return undefined;
  }

  #getFirstValueMatchingPaths(paths) {
    for (let path of paths) {
      let values = JSONPath.query(this.#data, path, 1);
      if (values.length > 0) return values[0];
    }
    return undefined;
  }

  #formatValue(value) {
    if (value === true) return "Yes";

    if (value === false) return "No";

    return value;
  }

  #handleThumbnailLoad(event) {
    event.target.hidden = false;
  }

  #handleHeroLoad(event) {
    let width = event.target.naturalWidth;
    let height = event.target.naturalHeight;

    event.target.hidden = false;

    let descriptorElement = event.target.parentElement;
    descriptorElement.style.setProperty("--hero-width", width);
    descriptorElement.style.setProperty("--hero-height", height);
  }

  #handleImageError(event) {
    event.target.remove();
  }
}

customElements.define("verifiable-credential", VerifiableCredential);

/*global window*/
(function (serverside, global, $, _, JSON) {
  console.log("loaded credential render script");

  $.fn.credentialRender = function (options) {
    options = _.defaults({}, options, {});
    console.log("options are ", options);
    var domEl = $(this);
    var vc = document.createElement("verifiable-credential");
    vc.setAttribute("data", JSON.stringify(options.data));
    console.log("got data", vc.data);
    domEl.html(vc);
  };

  global.credentialRender = global.credentialRender || { util: {} };
})(
  typeof exports !== "undefined",
  typeof exports !== "undefined" ? exports : window,
  typeof jQuery !== "undefined" ? jQuery : { fn: {} },
  typeof _ !== "undefined" ? _ : null,
  JSON
);
