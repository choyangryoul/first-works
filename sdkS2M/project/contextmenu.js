
		var gui = require('nw.gui');
		
		var currentWindow = gui.Window.get();
		currentWindow.isFullscreen = true;

		currentWindow.on('enter-fullscreen', function() {
			console.log('Window has entered fullscreen mode');
		});

		currentWindow.on('leave-fullscreen', function() {
			console.log('Windows has left fullscreen mode');
		});

		var menu = new gui.Menu();
		menu.append(new gui.MenuItem({label: 'menu Item1'}));
		var menuItem = new gui.MenuItem({
			type: 'checkbox',
			label: 'Menu Checkbox',
			tooltip: 'hello World',
			click: function () {
				alert('menu checkbox!!');
			},
			enable: true,
			checked: true,
			key: 'M',
			modifiers: 'ctrl-shift'
		});
		menu.append(menuItem);
		var area = document.getElementById('area');
		if(area) {
			area.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			menu.popup(e.x, e.y);
			return false;
		});
		} else {
			alert('area is not exist');
		}
