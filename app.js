// ****** SELECT ITEMS **********
const alert = document.querySelector('.alert');
const form = document.querySelector('.grocery-form');
const grocery = document.getElementById('grocery');
const submitBtn = document.querySelector('.submit-btn');
const container = document.querySelector('.grocery-container');
const list = document.querySelector('.grocery-list');
const clearBtn = document.querySelector('.clear-btn');

// edit option
let editElement;
let editFlag = false;
let editID = '';

// ****** EVENT LISTENERS **********
// submit form
form.addEventListener('submit', addItem);
// clear items
clearBtn.addEventListener('click', clearItems);
// load items from local storage
window.addEventListener('DOMContentLoaded', setupItems);

// ****** FUNCTIONS **********
function addItem(e) {
	e.preventDefault();
	const value = grocery.value;
	// console.log(value);

	// hack using date to retrieve a unique ID
	const id = new Date().getTime().toString();
	// console.log(id);

	// if the value is not empty
	// if (value !== '' && editFlag === false) {
	// using truthy/falsy and ! operator, instead of explicitly checking values
	if (value && !editFlag) {
		createListItem(id, value);
		// display alert
		displayAlert('item added to the list', 'success');
		// show container
		container.classList.add('show-container');
		// add to local storage
		addToLocalStorage(id, value);
		// set back to default
		setBackToDefault();
	} else if (value && editFlag) {
		// set the value of the grocery-item's p tags to be the value that has been entered into the form
		editElement.innerHTML = value;
		displayAlert('value changed', 'success');
		// edit local storage
		editLocalStorage(editID, value);
		// change back to submit/default function
		setBackToDefault();
	} else {
		displayAlert('empty value', 'danger');
	}
}

// display alert
function displayAlert(text, action) {
	alert.textContent = text;
	alert.classList.add(`alert-${action}`);

	// remove alert
	setTimeout(function () {
		alert.textContent = '';
		alert.classList.remove(`alert-${action}`);
	}, 1000);
}

// clear items
function clearItems() {
	const items = document.querySelectorAll('.grocery-item');
	if (items.length > 0) {
		items.forEach(function (item) {
			list.removeChild(item);
		});
	}
	// remove clear items button
	container.classList.remove('show-container');
	displayAlert('empty list', 'danger');
	// even though container is removed, if you're editing, you need to set things back to default submit state
	setBackToDefault();
	localStorage.removeItem('list');
}

// set back to default
function setBackToDefault() {
	grocery.value = '';
	// below not necessary for addItem, but used elsewhere
	editFlag = false;
	editID = '';
	submitBtn.textContent = 'submit';
}

// delete function
function deleteItem(e) {
	// parent of parent (btn-container) of delete-btn is grocery-item
	const element = e.currentTarget.parentElement.parentElement;
	const id = element.dataset.id;
	// remove grocery-item from grocery-container (grocery-item's parent)
	list.removeChild(element);
	// hides clear-items button
	if (list.children.length === 0) {
		container.classList.remove('show-container');
	}
	displayAlert('item removed', 'danger');
	// if in edit mode, go back to submit/default
	setBackToDefault();
	// remove from local storage
	removeFromLocalStorage(id);
}

// edit function
function editItem(e) {
	// parent of parent (btn-container) of delete-btn is grocery-item
	const element = e.currentTarget.parentElement.parentElement;

	// set edit item
	// parent element is button container.  previous sibling of button container is p with class title (the name of the item)
	editElement = e.currentTarget.parentElement.previousElementSibling;

	// set form value
	// puts the text value of the grocery item being edited (what's inside the p tags) into the form
	grocery.value = editElement.innerHTML;
	editFlag = true;
	editID = element.dataset.id;
	submitBtn.textContent = 'edit';
}

// ****** LOCAL STORAGE **********
function addToLocalStorage(id, value) {
	// const grocery = { id: id, value: value };
	// ES6 shorthand below (if names are the same like above)
	const grocery = { id, value };
	// ?: checks if element preceeding it isn't null, first value is what it sets if it exists, second value is what it sets if it doesn't exist
	let items = getLocalStorage();
	// first time this runs (from empty list), it will be an empty array
	// afterwards, it will include the entire list including the new item
	items.push(grocery);
	localStorage.setItem('list', JSON.stringify(items));
}

function removeFromLocalStorage(id) {
	let items = getLocalStorage();
	// below goes through all the items in storage and removes the selected item.
	// it does this by setting the items variable to what is in the local storage, and then modifying this variable such that the list doesn't include the selected item
	items = items.filter(function (item) {
		// if the item being removed is not the current item being iterated through, otherwise don't return anything (thus item will not be in the newly filtered list at end of iteration)
		if (item.id !== id) {
			return item;
		}
	});
	localStorage.setItem('list', JSON.stringify(items));
}

function editLocalStorage(id, value) {
	let items = getLocalStorage();
	// iterate over entire item list, and simply map the old item back into the list if it's not the editted element
	// if it is the edited element (the one with the matching id), change the value of that item to be the new value passed in as an argument, then return the modified item
	items = items.map(function (item) {
		if (item.id === id) {
			item.value = value;
		}
		return item;
	});
	localStorage.setItem('list', JSON.stringify(items));
}

function getLocalStorage() {
	return localStorage.getItem('list')
		? JSON.parse(localStorage.getItem('list'))
		: [];
}

// localStorage API
// setItem
// getItem
// removeItem
// save as strings
// localStorage.setItem('orange', JSON.stringify(['item1', 'item2']));
// let oranges = JSON.parse(localStorage.getItem('orange'));
// console.log(oranges);
// localStorage.removeItem('orange');
// oranges = JSON.parse(localStorage.getItem('orange'));
// console.log(oranges);

// ****** SETUP ITEMS **********

function setupItems() {
	let items = getLocalStorage();
	if (items.length > 0) {
		items.forEach(function (item) {
			createListItem(item.id, item.value);
		});
		container.classList.add('show-container');
	}
}

function createListItem(id, value) {
	const element = document.createElement('article');
	// add class
	element.classList.add('grocery-item');
	// add id
	const attr = document.createAttribute('data-id');
	attr.value = id;
	element.setAttributeNode(attr);
	element.innerHTML = `<p class="title">${value}</p>
						<div class="btn-container">
							<button type="button" class="edit-btn">
								<i class="fas fa-edit"></i>
							</button>
							<button type="button" class="delete-btn">
								<i class="fas fa-trash"></i>
							</button>
						</div>`;
	// console.log(element.innerHTML);

	// these can be retrieved now that the button has been added
	const deleteBtn = element.querySelector('.delete-btn');
	const editBtn = element.querySelector('.edit-btn');
	deleteBtn.addEventListener('click', deleteItem);
	editBtn.addEventListener('click', editItem);

	// append child
	list.appendChild(element);
}
