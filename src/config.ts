import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/* =======================
   Site Configuration
======================= */
export const siteConfig: SiteConfig = {
	title: "Z3R0S",
	subtitle: "Blog",
	lang: "en",
	themeColor: {
		hue: 0,
		fixed: false,
	},
	banner: {
		enable: true,
		src: "assets/images/demo-banner.png", // غيرها لو حابب
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

/* =======================
   Navbar Configuration
======================= */
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
	],
};

/* =======================
   Profile Configuration
======================= */
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // حط صورتك هنا
	name: "Z3R0S",
	bio: "RTO. | Teenage Hacker | CRTA | CNSP | CRTOM | CTF Player | Pro Labs : Mythical Puppet Dante",
	links: [
	{
		name: "CTFtime",
		icon: "fa6-solid:flag",
		url: "https://ctftime.org/team/413288",
	},
	{
		name: "TryHackMe",
		icon: "fa6-solid:skull", // أيقونة مناسبة للـ THM
		url: "https://tryhackme.com/p/ZEros666",
	},
	{
		name: "LinkedIn",
		icon: "fa6-brands:linkedin",
		url: "https://www.linkedin.com/in/omar-elfakharany/",
	},
	{
		name: "Links",
		icon: "fa6-solid:link",
		url: "https://linktr.ee/ZEros6",
	},
],

};


/* =======================
   License Configuration
======================= */
export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

/* =======================
   Code Highlighting
======================= */
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
