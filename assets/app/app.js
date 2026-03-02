window.onload = function () {
  var activeTabs = document.getElementsByClassName('tab active');
  if (activeTabs.length > 0) {
    var targetElementId = activeTabs[0].dataset.target;
    displayElementById(targetElementId);
  }
};

function openTargetTab(event) {
  var clickedTabElement = event.currentTarget;
  var tabContentElementId = clickedTabElement.dataset.target;

  deactivateTabs();
  hideContent();
  displayElementById(tabContentElementId);
  activate(clickedTabElement);
}

function activate(tabElement) {
  tabElement.classList.add('active');
}

function deactivate(tabElement) {
  tabElement.classList.remove('active');
}

function deactivateTabs() {
  var tabElements = document.getElementsByClassName('tab');
  for (var i = 0; i < tabElements.length; ++i) {
    deactivate(tabElements[i]);
  }
}

function display(element) {
  element.style.display = 'block';
}

function displayElementById(id) {
  var element = document.getElementById(id);
  display(element);
}

function hide(element) {
  element.style.display = 'none';
}

function hideContent() {
  var tabContentElements = document.getElementsByClassName('tab__content');
  for (var i = 0; i < tabContentElements.length; ++i) {
    hide(tabContentElements[i]);
  }
}
