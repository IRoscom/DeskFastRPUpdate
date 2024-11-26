// ==UserScript==
// @name         Desk FastRP Rework
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Улучшаем оформление и взаимодействие листа.
// @author       Roscom
// @match        https://desk.fastrp.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fastrp.ru
// @grant        GM_addStyle
// ==/UserScript==

(function () {
	"use strict";
	let deskFastRp = "https://desk.fastrp.ru/";
	let forumFastRp = "https://fastrp.ru/";
	GM_addStyle(
		"td > a {color: #7289da; text-decoration: none;} .clipboard { color: #fff; transition: height 0.3s, height 0.3s, color 0.3s ease-in-out;} .clipboard:hover { color: #999999; width: 17px; height: 17px;} .clipboard:active { color: #464646; transition: clear}"
	);
	updateLogo();
	replaceLink();
	createButtonHoursLeaderboard();
	createButtonForum();
	main();
	function main() {
		const category = window.location.pathname.split("/")[1];
		const blocks = document.querySelectorAll("tbody > tr");
		let link;
		switch (category) {
			case "economy":
			case "hours_leaderboard.php":
				blocks.forEach((element) => {
					const checkUser = element.querySelectorAll("td");
					if (checkUser.length == 0) return;
					const user = checkUser.item(1);
					const steamId = user.querySelector("a").textContent;
					link = {
						href: banlistLink(steamId),
						nick: toEscape(user.firstChild.textContent.slice(0, -1)),
					};
					user.innerHTML = user.innerHTML.replace(
						link.nick,
						`<a href=${link.href}>${link.nick}</a>`
					);
					user.appendChild(clipboard(steamId));
				});
				break;
			case "staff":
				const joinedUser = document
					.getElementsByClassName("panel-title")
					.item(0);
				joinedUser.outerHTML = joinedUser.outerHTML.replace("h4", "h3");
				blocks.forEach((element) => {
					const user = element.querySelector('td[data-label="Никнейм"]');
					const steamId = user.querySelector("a").textContent;
					link = {
						href: banlistLink(steamId),
						nick: toEscape(user.firstChild.textContent.slice(0, -1)),
					};
					user.innerHTML = user.innerHTML.replace(
						link.nick,
						`<a href=${link.href}>${link.nick}</a>`
					);
					user.appendChild(clipboard(steamId));
				});
				break;
		}
	}

	function replaceLink() {
		document.querySelector("div.navbar-header > a").href = deskFastRp;
	}
	function createButtonForum() {
		const element = document.createElement("li");
		element.innerHTML = `<a class="forum" href="${forumFastRp}">Форум</a>`;
		document.querySelector("ul.navbar-nav").prepend(element);
	}
	function createButtonHoursLeaderboard() {
		const login = document.querySelectorAll("ul.navbar-nav > li").item(4);
		const link = login.querySelector("a");
		link.href = deskFastRp + "hours_leaderboard.php";
		link.textContent = "Лидеры Часов";
		if (window.location.href == link.href) link.className = "active";
	}
	function updateLogo() {
		const logo = document.querySelector("img.logo");
		logo.src = "https://fastrp.ru/styles/dimensiondark/basic/publicLogoUrl.png";
	}

	/**
	 *
	 * @param {String} steamId
	 * @returns {URL}
	 */
	function banlistLink(steamId) {
		const banlistUrl = new URL("https://desk.fastrp.ru/bans");
		banlistUrl.searchParams.set("pages", 1);
		banlistUrl.searchParams.set("steamid", steamId);
		return banlistUrl;
	}
	/**
	 *
	 * @param {String} content
	 * @returns {Element}
	 */
	function clipboard(content) {
		const btnCopy = document.createElement("span");
		btnCopy.textContent = "Копировать";
		btnCopy.className = "clipboard";
		btnCopy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512", width="15px", height="15px" class="clipboard"><path fill="currentColor" d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l140.1 0L400 115.9 400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-204.1c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-32-48 0 0 32c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l32 0 0-48-32 0z"/></svg>`;
		btnCopy.style.cursor = "pointer";
		btnCopy.addEventListener("click", () => {
			navigator.clipboard.writeText(content);
		});
		return btnCopy;
	}
	/**
	 *
	 * @param {String} words
	 * @returns {String}
	 */
	function toEscape(words) {
		const escapables = {
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;",
		};
		const toEscape = /<|>|&/g;
		return words.replace(toEscape, (r) => escapables[r]);
	}
	/**
	 *
	 * @param {Function} func
	 * @param {Number} wait
	 * @returns {void}
	 */
	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			const later = () => {
				timeout = null;
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}
	/**
	 * @param {String} steamId
	 * @returns {String}
	 */
	function convertSteamId(steamId) {
		// W=Z*2+V+Y
		let steamId64 = 76561197960265728n;
		const [, individual, identifier] = steamId.split(":");
		steamId64 += BigInt(identifier * 2);
		if (individual == "1") steamId64 += 1n;
		return `https://steamcommunity.com/profiles/` + steamId64.toString();
	}

	/**
	 * @param {Element} reason
	 * @returns {void}
	 */
	function linkableSteamId(reason) {
		const result = RegExp(/STEAM_[10]:[10]:[0-9]+/g).exec(reason.textContent);
		if (!result) return;
		reason.innerHTML = reason.innerHTML.replace(
			result[0],
			`<a href=${convertSteamId(result[0])} class="profileByAdmin">${
				result[0]
			}</a>`
		);
	}

	const general = debounce(() => {
		if (!window.location.pathname.includes("bans")) return;
		const blocks = document.querySelectorAll("tbody > tr");
		blocks.forEach((element) => {
			const admin = element.querySelector('td[data-label="Админ"]');
			admin.addEventListener("click", () => {
				window.location.href = banlistLink(
					admin.querySelector("a").textContent
				);
			});
			const reason = element.querySelector('td[data-label="Причина"]');
			const unbanReason = element.querySelector(
				'td[data-label="Причина разбана"]'
			);
			if (reason && !reason.querySelector("a.profileByAdmin"))
				linkableSteamId(reason);
			if (unbanReason && !unbanReason.querySelector("a.profileByAdmin"))
				linkableSteamId(unbanReason);
		});
	}, 200);

	const observer = new MutationObserver((mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type == "childList") {
				general();
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});
})();
