/*
  HA legacy Form.io shell overrides

  One-file script for old Form.io / AngularJS framework.

  Includes:
  - Wizard button styling
  - Responsive wizard button ordering
  - Mobile tab order fix
  - Framework .alert-danger colour override using newer soft error style
  - Field-level .has-error .help-block colour override
  - Error arrow alignment for old inline validation messages
  - Top validation summary enhancement using the existing framework alert where possible
  - Summary only reads Angular-visible messages, respecting ng-hide

  Breakpoints:
  xs:  0px
  xxs: 640px
  sm:  768px
  md:  992px
  lg:  1200px
  xl:  1400px
*/

(function () {
  var STYLE_ID = "ha-formio-shell-overrides";
  var SUMMARY_ID = "ha-formio-validation-summary";
  var OBSERVER_FLAG = "__haFormioShellObserverStarted";
  var RESIZE_FLAG = "__haFormioShellResizeStarted";
  var VALIDATION_FLAG = "__haFormioValidationTriggersWired";
  var MOBILE_MEDIA_QUERY = "screen and (max-width: 767px)";

  function init() {
    injectStyles();
    reorderWizardButtonsForViewport();
    wireValidationTriggers();
    startResizeHandler();
    startMutationObserver();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var css = ""

      /*
        Framework danger alert override.
        This applies the newer error style to the old framework .alert-danger.
      */
      + ".alert.alert-danger,"
      + "div.alert.alert-danger,"
      + ".alert-danger {"
      + "  background-color: #FDE7E9 !important;"
      + "  color: #4A0000 !important;"
      + "  border: 2px solid #AB0000 !important;"
      + "  border-radius: 4px !important;"
      + "  padding: 16px 18px !important;"
      + "}"

      + ".alert.alert-danger h2,"
      + "div.alert.alert-danger h2,"
      + ".alert-danger h2 {"
      + "  color: #4A0000 !important;"
      + "  margin: 0 0 8px 0 !important;"
      + "  font-size: 20px !important;"
      + "  line-height: 1.3 !important;"
      + "}"

      + ".alert.alert-danger p,"
      + "div.alert.alert-danger p,"
      + ".alert-danger p {"
      + "  color: #4A0000 !important;"
      + "  margin: 0 0 8px 0 !important;"
      + "}"

      + ".alert.alert-danger ul,"
      + "div.alert.alert-danger ul,"
      + ".alert-danger ul {"
      + "  margin: 8px 0 0 20px !important;"
      + "  padding: 0 !important;"
      + "}"

      + ".alert.alert-danger li,"
      + "div.alert.alert-danger li,"
      + ".alert-danger li {"
      + "  margin: 6px 0 !important;"
      + "}"

      + ".alert.alert-danger a,"
      + "div.alert.alert-danger a,"
      + ".alert-danger a {"
      + "  color: #4A0000 !important;"
      + "  font-weight: 600 !important;"
      + "  text-decoration: underline !important;"
      + "  text-underline-offset: 3px !important;"
      + "}"

      + ".alert.alert-danger:focus,"
      + "div.alert.alert-danger:focus,"
      + ".alert-danger:focus {"
      + "  outline: 3px solid #000000 !important;"
      + "  outline-offset: 2px !important;"
      + "}"

      /*
        Respect Angular hidden validation messages.
        Do not let our styling wake up hidden validators.
      */
      + ".has-error .help-block.ng-hide,"
      + ".form-group.has-error .help-block.ng-hide,"
      + ".formio-component.has-error .help-block.ng-hide,"
      + ".has-error .help-block[aria-hidden='true'],"
      + ".form-group.has-error .help-block[aria-hidden='true'],"
      + ".formio-component.has-error .help-block[aria-hidden='true'] {"
      + "  display: none !important;"
      + "}"

      /*
        Field-level inline validation errors.
        Angular/Form.io controls visibility.
        We only style messages that are already visible.
      */
      + ".has-error .help-block:not(.ng-hide),"
      + ".form-group.has-error .help-block:not(.ng-hide),"
      + ".formio-component.has-error .help-block:not(.ng-hide) {"
      + "  position: relative !important;"
      + "  overflow: visible !important;"
      + "  background-color: #FDE7E9 !important;"
      + "  color: #4A0000 !important;"
      + "  border: 2px solid #AB0000 !important;"
      + "  border-radius: 4px !important;"
      + "  padding: 10px 12px !important;"
      + "  margin-top: 12px !important;"
      + "  font-weight: 600 !important;"
      + "}"

      + ".has-error .help-block:not(.ng-hide) a,"
      + ".form-group.has-error .help-block:not(.ng-hide) a,"
      + ".formio-component.has-error .help-block:not(.ng-hide) a {"
      + "  color: #4A0000 !important;"
      + "  font-weight: 700 !important;"
      + "  text-decoration: underline !important;"
      + "  text-underline-offset: 3px !important;"
      + "}"

      + ".has-error .help-block:not(.ng-hide):focus,"
      + ".form-group.has-error .help-block:not(.ng-hide):focus,"
      + ".formio-component.has-error .help-block:not(.ng-hide):focus {"
      + "  outline: 3px solid #000000 !important;"
      + "  outline-offset: 2px !important;"
      + "}"

      /*
        Error arrow.
        Only applies to visible framework validation messages.
        Anchored relative to the box, not static top:-12px.
      */
      + ".has-error .help-block:not(.ng-hide):before,"
      + ".has-error .help-block:not(.ng-hide)::before,"
      + ".form-group.has-error .help-block:not(.ng-hide):before,"
      + ".form-group.has-error .help-block:not(.ng-hide)::before,"
      + ".formio-component.has-error .help-block:not(.ng-hide):before,"
      + ".formio-component.has-error .help-block:not(.ng-hide)::before {"
      + "  content: '' !important;"
      + "  position: absolute !important;"
      + "  bottom: calc(100% + 1px) !important;"
      + "  left: 22px !important;"
      + "  width: 0 !important;"
      + "  height: 0 !important;"
      + "  padding: 0 !important;"
      + "  margin: 0 !important;"
      + "  box-sizing: content-box !important;"
      + "  line-height: 0 !important;"
      + "  background: transparent !important;"
      + "  border-left: 10px solid transparent !important;"
      + "  border-right: 10px solid transparent !important;"
      + "  border-bottom: 10px solid #AB0000 !important;"
      + "  border-top: 0 !important;"
      + "  z-index: 2 !important;"
      + "}"

      /*
        Disable old inner/fill arrow if the framework has one.
      */
      + ".has-error .help-block:not(.ng-hide):after,"
      + ".has-error .help-block:not(.ng-hide)::after,"
      + ".form-group.has-error .help-block:not(.ng-hide):after,"
      + ".form-group.has-error .help-block:not(.ng-hide)::after,"
      + ".formio-component.has-error .help-block:not(.ng-hide):after,"
      + ".formio-component.has-error .help-block:not(.ng-hide)::after {"
      + "  content: none !important;"
      + "  display: none !important;"
      + "  padding: 0 !important;"
      + "  margin: 0 !important;"
      + "}"

      /*
        Wizard button base layout
      */
      + "ul.list-inline[ng-show='wizardLoaded'] {"
      + "  margin: 24px 0 0 0 !important;"
      + "  padding: 0 !important;"
      + "  width: 100% !important;"
      + "  list-style: none !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] > li {"
      + "  margin: 0 !important;"
      + "  padding: 0 !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] a {"
      + "  box-sizing: border-box !important;"
      + "  min-height: 32px !important;"
      + "  padding: 8px 18px !important;"
      + "  border-radius: 999px !important;"
      + "  font-weight: 600 !important;"
      + "  line-height: 1.2 !important;"
      + "  text-align: center !important;"
      + "  text-decoration: none !important;"
      + "  box-shadow: none !important;"
      + "}"

      /*
        Primary: Next / Submit
      */
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-next,"
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-submit {"
      + "  background: #00558B !important;"
      + "  border: 1px solid #00558B !important;"
      + "  color: #ffffff !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-next:hover,"
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-submit:hover {"
      + "  background: #00466f !important;"
      + "  border-color: #00466f !important;"
      + "  color: #ffffff !important;"
      + "  text-decoration: none !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-next:focus,"
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-submit:focus {"
      + "  background: #00466f !important;"
      + "  border-color: #00466f !important;"
      + "  color: #ffffff !important;"
      + "  text-decoration: underline !important;"
      + "  text-underline-offset: 3px !important;"
      + "  text-decoration-thickness: 2px !important;"
      + "}"

      /*
        Secondary: Previous
      */
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-previous {"
      + "  background: #ffffff !important;"
      + "  border: 1px solid #00558B !important;"
      + "  color: #00558B !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-previous:hover {"
      + "  background: #eef6fb !important;"
      + "  border-color: #00558B !important;"
      + "  color: #00558B !important;"
      + "  text-decoration: none !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-previous:focus {"
      + "  background: #eef6fb !important;"
      + "  border-color: #00558B !important;"
      + "  color: #00558B !important;"
      + "  text-decoration: underline !important;"
      + "  text-underline-offset: 3px !important;"
      + "  text-decoration-thickness: 2px !important;"
      + "}"

      /*
        Cancel
      */
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-cancel {"
      + "  background: transparent !important;"
      + "  border: 0 !important;"
      + "  color: #AB0000 !important;"
      + "  box-shadow: none !important;"
      + "  font-weight: 600 !important;"
      + "}"

      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-cancel:hover,"
      + "ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-cancel:focus {"
      + "  background: transparent !important;"
      + "  color: #8f0000 !important;"
      + "  text-decoration: underline !important;"
      + "  text-underline-offset: 3px !important;"
      + "  text-decoration-thickness: 2px !important;"
      + "}"

      /*
        Keyboard focus
      */
      + "ul.list-inline[ng-show='wizardLoaded'] a:focus {"
      + "  outline: 2px solid #000000 !important;"
      + "  outline-offset: 2px !important;"
      + "}"

      /*
        Mobile / below sm: 0px to 767px
        DOM is reordered by JS to:
        Next / Submit
        Previous
        Cancel
      */
      + "@media screen and (max-width: 767px) {"

      + "  ul.list-inline[ng-show='wizardLoaded'] {"
      + "    display: flex !important;"
      + "    flex-direction: column !important;"
      + "    align-items: stretch !important;"
      + "    gap: 12px !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] > li {"
      + "    display: block !important;"
      + "    width: 100% !important;"
      + "    text-align: center !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] a {"
      + "    display: block !important;"
      + "    width: 100% !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-cancel {"
      + "    padding: 4px 0 !important;"
      + "    min-height: 24px !important;"
      + "  }"

      + "}"

      /*
        sm and above: 768px+
        DOM is reordered by JS to:
        Cancel
        Previous
        Next / Submit
      */
      + "@media screen and (min-width: 768px) {"

      + "  ul.list-inline[ng-show='wizardLoaded'] {"
      + "    display: flex !important;"
      + "    flex-direction: row !important;"
      + "    align-items: center !important;"
      + "    gap: 30px !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] > li {"
      + "    display: inline-flex !important;"
      + "    width: auto !important;"
      + "    text-align: center !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] a {"
      + "    display: inline-block !important;"
      + "    min-width: 96px !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] > li:nth-child(2) {"
      + "    margin-left: auto !important;"
      + "  }"

      + "  ul.list-inline[ng-show='wizardLoaded'] .formio-wizard-button-cancel {"
      + "    min-width: auto !important;"
      + "    padding: 8px 0 !important;"
      + "  }"

      + "}";

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.type = "text/css";

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
  }

  function isMobileViewport() {
    if (window.matchMedia) {
      return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    }

    return window.innerWidth < 768;
  }

  function reorderWizardButtonsForViewport() {
    var isMobile = isMobileViewport();
    var lists = document.querySelectorAll("ul.list-inline[ng-show='wizardLoaded']");

    for (var i = 0; i < lists.length; i++) {
      reorderWizardButtonList(lists[i], isMobile);
    }
  }

  function reorderWizardButtonList(list, isMobile) {
    if (!list) {
      return;
    }

    var cancelLi = getButtonListItem(list, "formio-wizard-button-cancel");
    var previousLi = getButtonListItem(list, "formio-wizard-button-previous");
    var nextLi = getButtonListItem(list, "formio-wizard-button-next");
    var submitLi = getButtonListItem(list, "formio-wizard-button-submit");

    var primaryLi = nextLi || submitLi;
    var desiredOrder = isMobile
      ? [primaryLi, previousLi, cancelLi]
      : [cancelLi, previousLi, primaryLi];

    desiredOrder = removeMissingItems(list, desiredOrder);

    if (isCurrentOrder(list, desiredOrder)) {
      return;
    }

    for (var i = 0; i < desiredOrder.length; i++) {
      list.appendChild(desiredOrder[i]);
    }
  }

  function getButtonListItem(list, buttonClass) {
    if (!list || !buttonClass) {
      return null;
    }

    var button = list.querySelector("." + buttonClass);

    if (!button) {
      return null;
    }

    return getClosestListItem(button);
  }

  function getClosestListItem(element) {
    while (element && element.nodeType === 1) {
      if (String(element.tagName).toLowerCase() === "li") {
        return element;
      }

      element = element.parentNode;
    }

    return null;
  }

  function removeMissingItems(list, items) {
    var result = [];

    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i].parentNode === list) {
        result.push(items[i]);
      }
    }

    return result;
  }

  function isCurrentOrder(list, desiredOrder) {
    var actualOrder = [];
    var children = list.children;

    for (var i = 0; i < children.length; i++) {
      for (var d = 0; d < desiredOrder.length; d++) {
        if (children[i] === desiredOrder[d]) {
          actualOrder.push(children[i]);
        }
      }
    }

    if (actualOrder.length !== desiredOrder.length) {
      return false;
    }

    for (var j = 0; j < desiredOrder.length; j++) {
      if (actualOrder[j] !== desiredOrder[j]) {
        return false;
      }
    }

    return true;
  }

  function wireValidationTriggers() {
    if (document[VALIDATION_FLAG]) {
      return;
    }

    document[VALIDATION_FLAG] = true;

    document.addEventListener("click", function (event) {
      var target = event.target || event.srcElement;

      if (!target) {
        return;
      }

      if (closestHasClass(target, "formio-wizard-button-next") ||
          closestHasClass(target, "formio-wizard-button-submit") ||
          closestHasClass(target, "btn-primary")) {

        window.setTimeout(function () {
          buildValidationSummary(true);
        }, 150);
      }
    }, true);

    document.addEventListener("submit", function () {
      window.setTimeout(function () {
        buildValidationSummary(true);
      }, 150);
    }, true);

    document.addEventListener("change", function () {
      window.setTimeout(function () {
        buildValidationSummary(false);
      }, 150);
    }, true);

    document.addEventListener("blur", function () {
      window.setTimeout(function () {
        buildValidationSummary(false);
      }, 150);
    }, true);
  }

  function buildValidationSummary(moveFocus) {
    var errors = collectErrors();

    if (!errors.length) {
      clearEnhancedSummary();
      return;
    }

    var summary = getOrCreateSummary();

    if (!summary) {
      return;
    }

    var listHtml = "";

    for (var i = 0; i < errors.length; i++) {
      listHtml += "<li>"
        + "<a href=\"#\" data-ha-error-index=\"" + i + "\">"
        + escapeHtml(errors[i].message)
        + "</a>"
        + "</li>";
    }

    summary.innerHTML =
      "<h2>There is a problem</h2>"
      + "<p>Please fix the following errors before continuing.</p>"
      + "<ul>"
      + listHtml
      + "</ul>";

    summary._haErrors = errors;
    summary.style.display = summary._haOriginalDisplay || "";

    wireSummaryLinks(summary);

    if (moveFocus) {
      window.setTimeout(function () {
        try {
          summary.focus();
        } catch (e) {}
      }, 0);
    }
  }

  function collectErrors() {
    var results = [];
    var seen = {};

    /*
      Only collect validation messages Angular/Form.io has actually made visible.
      Do not collect every .has-error container.
    */
    var visibleMessages = document.querySelectorAll(
      ".form-group.has-error .help-block:not(.ng-hide),"
      + ".formio-component.has-error .help-block:not(.ng-hide),"
      + ".has-error .help-block:not(.ng-hide)"
    );

    for (var i = 0; i < visibleMessages.length; i++) {
      var messageNode = visibleMessages[i];

      if (!isVisible(messageNode) || isHiddenByAngular(messageNode)) {
        continue;
      }

      if (isInsideSummary(messageNode)) {
        continue;
      }

      var container = findErrorContainer(messageNode);

      if (!container) {
        continue;
      }

      var message = getErrorMessageFromVisibleNode(messageNode, container);

      if (!message) {
        continue;
      }

      var field = getFocusableField(container);
      var key = message + "::" + getElementKey(field || container);

      if (seen[key]) {
        continue;
      }

      seen[key] = true;

      results.push({
        message: message,
        field: field || container
      });
    }

    return results;
  }

  function getErrorMessageFromVisibleNode(messageNode, container) {
    var inlineMessage = cleanText(messageNode.textContent || messageNode.innerText || "");
    var label = getFieldLabel(container);

    if (inlineMessage && isSummaryFriendlyMessage(inlineMessage)) {
      return inlineMessage;
    }

    if (label) {
      return label + " has an invalid value.";
    }

    return "A field has an invalid value.";
  }

  function findErrorContainer(node) {
    var current = node;

    while (current && current.nodeType === 1) {
      if (hasClass(current, "formio-component") ||
          hasClass(current, "form-group") ||
          hasClass(current, "has-error")) {
        return current;
      }

      current = current.parentNode;
    }

    return node.parentNode;
  }

  function isHiddenByAngular(node) {
    var current = node;

    while (current && current.nodeType === 1) {
      if (hasClass(current, "ng-hide") ||
          current.getAttribute("aria-hidden") === "true") {
        return true;
      }

      current = current.parentNode;
    }

    return false;
  }

  function isInsideSummary(node) {
    var current = node;

    while (current && current.nodeType === 1) {
      if (current.id === SUMMARY_ID ||
          current.getAttribute("data-ha-enhanced") === "true") {
        return true;
      }

      current = current.parentNode;
    }

    return false;
  }

  function isSummaryFriendlyMessage(message) {
    message = cleanText(message).toLowerCase();

    if (!message) {
      return false;
    }

    if (message.indexOf("please select") === 0) {
      return true;
    }

    if (message.indexOf("please enter") === 0) {
      return true;
    }

    if (message.indexOf("please provide") === 0) {
      return true;
    }

    if (message.indexOf("is required") > -1) {
      return true;
    }

    if (message.indexOf("required") > -1 &&
        message.indexOf("must") === -1) {
      return true;
    }

    /*
      Suppress low-level validator messages from the top summary.
      They remain inline because the framework shows them there.
    */
    if (message.indexOf("must be a number") > -1) {
      return false;
    }

    if (message.indexOf("must be numeric") > -1) {
      return false;
    }

    if (message.indexOf("must be a valid") > -1) {
      return false;
    }

    if (message.indexOf("does not match the pattern") > -1) {
      return false;
    }

    if (message.indexOf("invalid format") > -1) {
      return false;
    }

    if (message.indexOf("invalid value") > -1) {
      return false;
    }

    if (message.indexOf("minimum") > -1 ||
        message.indexOf("maximum") > -1 ||
        message.indexOf("minlength") > -1 ||
        message.indexOf("maxlength") > -1) {
      return false;
    }

    return false;
  }

  function getOrCreateSummary() {
    var existing = document.getElementById(SUMMARY_ID);

    if (existing) {
      existing.style.display = existing._haOriginalDisplay || "";
      return existing;
    }

    var nativeAlert = findExistingValidationAlert();

    if (nativeAlert) {
      nativeAlert.id = SUMMARY_ID;
      nativeAlert.className = ensureClass(nativeAlert.className, "alert");
      nativeAlert.className = ensureClass(nativeAlert.className, "alert-danger");
      nativeAlert.setAttribute("role", "alert");
      nativeAlert.setAttribute("aria-live", "assertive");
      nativeAlert.setAttribute("tabindex", "-1");
      nativeAlert.setAttribute("data-ha-enhanced", "true");
      nativeAlert.setAttribute("data-ha-native-alert", "true");

      nativeAlert._haOriginalDisplay = nativeAlert.style.display || "";
      nativeAlert._haOriginalHtml = nativeAlert.innerHTML;

      return nativeAlert;
    }

    /*
      Fallback only.
      This still uses the existing framework classes so the same CSS applies.
    */
    var summary = document.createElement("div");
    summary.id = SUMMARY_ID;
    summary.className = "alert alert-danger";
    summary.setAttribute("role", "alert");
    summary.setAttribute("aria-live", "assertive");
    summary.setAttribute("tabindex", "-1");
    summary.setAttribute("data-ha-enhanced", "true");
    summary.setAttribute("data-ha-created-alert", "true");

    var insertBefore = findFormInsertionPoint();

    if (insertBefore && insertBefore.parentNode) {
      insertBefore.parentNode.insertBefore(summary, insertBefore);
    } else {
      document.body.insertBefore(summary, document.body.firstChild);
    }

    return summary;
  }

  function findExistingValidationAlert() {
    var alerts = document.querySelectorAll(".alert.alert-danger, .alert-danger");

    for (var i = 0; i < alerts.length; i++) {
      var alert = alerts[i];

      if (!isVisible(alert) || isHiddenByAngular(alert)) {
        continue;
      }

      var text = cleanText(alert.textContent || alert.innerText || "");

      if (alert.getAttribute("data-ha-enhanced") === "true" ||
          text.indexOf("Please fix the following errors") > -1 ||
          text.indexOf("Please fix the following") > -1 ||
          text.indexOf("errors before proceeding") > -1 ||
          text.indexOf("There is a problem") > -1) {
        return alert;
      }
    }

    return null;
  }

  function getFieldLabel(container) {
    var label = container.querySelector("label");

    if (label) {
      return cleanLabelText(label.textContent || label.innerText || "");
    }

    var input = getFocusableField(container);

    if (input) {
      if (input.getAttribute("aria-label")) {
        return cleanLabelText(input.getAttribute("aria-label"));
      }

      if (input.getAttribute("placeholder")) {
        return cleanLabelText(input.getAttribute("placeholder"));
      }

      if (input.getAttribute("name")) {
        return cleanLabelText(input.getAttribute("name"));
      }
    }

    return "";
  }

  function cleanLabelText(value) {
    return cleanText(value)
      .replace(/\*+$/g, "")
      .replace(/\s+required$/i, "")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function getFocusableField(container) {
    if (!container) {
      return null;
    }

    var selectors = [
      "input:not([type='hidden']):not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ];

    for (var i = 0; i < selectors.length; i++) {
      var field = container.querySelector(selectors[i]);

      if (field && isVisible(field) && !isHiddenByAngular(field)) {
        return field;
      }
    }

    return null;
  }

  function findFormInsertionPoint() {
    var candidates = [
      ".formio-form",
      "form",
      ".formio",
      ".ng-scope"
    ];

    for (var i = 0; i < candidates.length; i++) {
      var node = document.querySelector(candidates[i]);

      if (node) {
        return node;
      }
    }

    return null;
  }

  function wireSummaryLinks(summary) {
    var links = summary.querySelectorAll("a[data-ha-error-index]");

    for (var i = 0; i < links.length; i++) {
      links[i].onclick = function (event) {
        if (event && event.preventDefault) {
          event.preventDefault();
        }

        var index = parseInt(this.getAttribute("data-ha-error-index"), 10);
        var errors = summary._haErrors || [];
        var error = errors[index];

        if (error && error.field) {
          focusField(error.field);
        }

        return false;
      };
    }
  }

  function focusField(field) {
    if (!field) {
      return;
    }

    try {
      if (typeof field.scrollIntoView === "function") {
        field.scrollIntoView({
          block: "center",
          inline: "nearest"
        });
      }
    } catch (e) {
      try {
        field.scrollIntoView();
      } catch (ignore) {}
    }

    window.setTimeout(function () {
      try {
        field.focus();
      } catch (e) {}
    }, 100);
  }

  function clearEnhancedSummary() {
    var existing = document.getElementById(SUMMARY_ID);

    if (!existing) {
      return;
    }

    if (existing.getAttribute("data-ha-created-alert") === "true") {
      if (existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      return;
    }

    if (existing.getAttribute("data-ha-native-alert") === "true") {
      existing.innerHTML = existing._haOriginalHtml || "";
      existing.style.display = existing._haOriginalDisplay || "";
      existing.removeAttribute("id");
      existing.removeAttribute("tabindex");
      existing.removeAttribute("data-ha-enhanced");
      existing.removeAttribute("data-ha-native-alert");
    }
  }

  function startResizeHandler() {
    if (window[RESIZE_FLAG]) {
      return;
    }

    window[RESIZE_FLAG] = true;

    if (window.addEventListener) {
      window.addEventListener("resize", debounce(function () {
        reorderWizardButtonsForViewport();
      }, 100));
    }
  }

  function startMutationObserver() {
    if (window[OBSERVER_FLAG]) {
      return;
    }

    window[OBSERVER_FLAG] = true;

    if (!window.MutationObserver || !document.body) {
      return;
    }

    var observer = new MutationObserver(debounce(function () {
      reorderWizardButtonsForViewport();
    }, 50));

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function debounce(fn, wait) {
    var timer = null;

    return function () {
      var context = this;
      var args = arguments;

      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    if (element.offsetWidth <= 0 && element.offsetHeight <= 0) {
      return false;
    }

    var style = window.getComputedStyle
      ? window.getComputedStyle(element)
      : element.currentStyle;

    if (!style) {
      return true;
    }

    return style.display !== "none" &&
           style.visibility !== "hidden" &&
           style.opacity !== "0";
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, "");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function hasClass(element, className) {
    if (!element || !className) {
      return false;
    }

    if (element.classList) {
      return element.classList.contains(className);
    }

    return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
  }

  function closestHasClass(element, className) {
    while (element && element.nodeType === 1) {
      if (hasClass(element, className)) {
        return true;
      }

      element = element.parentNode;
    }

    return false;
  }

  function ensureClass(className, requiredClass) {
    className = className || "";

    if ((" " + className + " ").indexOf(" " + requiredClass + " ") > -1) {
      return className;
    }

    return className ? className + " " + requiredClass : requiredClass;
  }

  function getElementKey(element) {
    if (!element) {
      return "";
    }

    return element.id ||
           element.name ||
           element.getAttribute("data-key") ||
           element.getAttribute("ref") ||
           cleanText(element.textContent || element.innerText || "");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
