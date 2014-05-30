var wechat = require('wechat');

var Config = {
	UserStatus: {
		NONE: "NONE",
		WELCOME: "WELCOME",
		WISH: "WISH",
		SHOWTASKS: "SHOWTASKS"
	}
}

var response = {
	"WELCOME": "许愿墙，回复数字选择服务：\n  \n 1.许愿 \n 2.查看愿望 \n 3.我许下的愿望 \n 4.我领取的愿望 \n",
	"WISH": "回复你的愿望"
}

var tasks = [], users = [];

exports.onMsg = wechat('gmartds', function(req, res, next) {
	var message = req.weixin;

	var userName = message.FromUserName;
	
	// 定位用户
	var currentUser = null;
	var flag = true;
	users.map(function(item) {
		if (item.userName) {
			flag = false;
			currentUser = item;
		}
	});
	if (flag) {
		var user = {
			userName: userName,
			status: Config.UserStatus.NONE
		}
		users.push(user);
		currentUser = user;
	}

	console.log(message, users, tasks);

	// 判断状态，显示内容
	if (currentUser.status == Config.UserStatus.NONE) {
		showWelcome(res, currentUser, message);
	} else if (currentUser.status == Config.UserStatus.WELCOME) {
		showWelcomeReply(res, currentUser, message);
	} else if (currentUser.status == Config.UserStatus.WISH) {
		saveTask(res, currentUser, message);
	} else if (currentUser.status == Config.UserStatus.SHOWTASKS) {
		getTask(res, currentUser, message);
	}
});
	
var showWelcome = function(res, user, msg) {
	res.reply(response[Config.UserStatus.WELCOME]);
	user.status = Config.UserStatus.WELCOME;
}

var showWelcomeReply = function(res, user, msg) {
	var content = msg.Content;
	switch (content) {
		case '1': {
			inviteWish(res, user);
			break ;
		}
		case '2': {
			showTasks(res, user, msg);
			break ;
		}
		case '3': {
			showMyWishs(res, user, msg);
			break ;
		}
		case '4': {
			break ;
		}
	}
}

//================================================= 愿望

var inviteWish = function(res, user) {
	res.reply(response[Config.UserStatus.WISH]);
	user.status = Config.UserStatus.WISH;
}

var saveTask = function(res, user, msg) {
	tasks.push({
		user: user,
		content: msg.Content,
		belong: null
	});
	res.reply("许愿成功");
	user.status = Config.UserStatus.NONE;
}

//================================================= 愿望

//================================================= 查看愿望
	
var showTasks = function(res, user, msg) {
	var str = "愿望列表，回复数字领取任务 \n \n";
	for (var i = 0, len = tasks.length; i < len; ++i) {
		if (tasks[i].belong == null) {
			str += (i + 1) + ". " + tasks[i].content + "\n";
		}
	}
	res.reply(str);
	user.status = Config.UserStatus.SHOWTASKS;
}

var getTask = function(res, user, msg) {
	for (var i = 0, len = tasks.length; i < len; ++i) {
		if (i + "" == msg.Content) {
			tasks[i].belong = user;
		}
	}
	res.reply("领取成功");
	user.status = Config.UserStatus.NONE;
}

//================================================= 查看愿望

//================================================= 查看我许下的愿望

var showMyWishs = function(res, user, msg) {
	var str = "我许下的愿望： \n \n";
	for (var i = 0, len = tasks.length; i < len; ++i) {
		if (tasks[i].user.userName == user.userName) {
			str += (i + 1) + ". " + tasks[i].content + "\n";
		}
	}
	res.reply(str);
	user.status = Config.UserStatus.NONE;
}

//================================================= 查看我许下的愿望

//================================================= 查看我领取的愿望

var showMyTasks = function(res, user, msg) {
	var str = "我领取的愿望： \n \n";
	for (var i = 0, len = tasks.length; i < len; ++i) {
		if (tasks[i].belong.userName == user.userName) {
			str += (i + 1) + ". " + tasks[i].content + "\n";
		}
	}
	res.reply(str);
	user.status = Config.UserStatus.NONE;
}

//================================================= 查看我领取的愿望