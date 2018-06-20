function findCheckedRadioButton(buttons) {
	for (let i = 0; i < buttons.length; i++) {
		let button = buttons[i];
		if (button.checked) {
			return button.value;
		}
	}
}
