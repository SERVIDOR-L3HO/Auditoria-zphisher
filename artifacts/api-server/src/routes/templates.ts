import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TEMPLATES = [
  { id: "facebook", name: "Facebook", category: "Social Media", description: "Classic Facebook login page clone", icon: "facebook", difficulty: "low" },
  { id: "instagram", name: "Instagram", category: "Social Media", description: "Instagram credential harvester", icon: "instagram", difficulty: "low" },
  { id: "google", name: "Google", category: "Email", description: "Google account login page", icon: "google", difficulty: "medium" },
  { id: "microsoft", name: "Microsoft", category: "Email", description: "Microsoft/Outlook login clone", icon: "microsoft", difficulty: "medium" },
  { id: "netflix", name: "Netflix", category: "Streaming", description: "Netflix subscription login page", icon: "netflix", difficulty: "low" },
  { id: "twitter", name: "Twitter / X", category: "Social Media", description: "Twitter/X login page clone", icon: "twitter", difficulty: "low" },
  { id: "linkedin", name: "LinkedIn", category: "Professional", description: "LinkedIn professional network login", icon: "linkedin", difficulty: "medium" },
  { id: "github", name: "GitHub", category: "Development", description: "GitHub developer login page", icon: "github", difficulty: "high" },
  { id: "dropbox", name: "Dropbox", category: "Storage", description: "Dropbox cloud storage login", icon: "dropbox", difficulty: "medium" },
  { id: "yahoo", name: "Yahoo Mail", category: "Email", description: "Yahoo mail credential harvester", icon: "yahoo", difficulty: "low" },
  { id: "protonmail", name: "ProtonMail", category: "Email", description: "ProtonMail secure email clone", icon: "protonmail", difficulty: "high" },
  { id: "paypal", name: "PayPal", category: "Finance", description: "PayPal payment platform clone", icon: "paypal", difficulty: "high" },
  { id: "ebay", name: "eBay", category: "E-Commerce", description: "eBay marketplace login clone", icon: "ebay", difficulty: "medium" },
  { id: "adobe", name: "Adobe", category: "Creative", description: "Adobe Creative Cloud login", icon: "adobe", difficulty: "medium" },
  { id: "apple", name: "Apple iCloud", category: "Cloud", description: "Apple ID / iCloud login page", icon: "apple", difficulty: "high" },
  { id: "spotify", name: "Spotify", category: "Streaming", description: "Spotify music platform clone", icon: "spotify", difficulty: "low" },
  { id: "twitch", name: "Twitch", category: "Streaming", description: "Twitch gaming platform login", icon: "twitch", difficulty: "medium" },
  { id: "pinterest", name: "Pinterest", category: "Social Media", description: "Pinterest image platform clone", icon: "pinterest", difficulty: "low" },
  { id: "discord", name: "Discord", category: "Communication", description: "Discord gaming/community login", icon: "discord", difficulty: "medium" },
  { id: "snapchat", name: "Snapchat", category: "Social Media", description: "Snapchat social media login", icon: "snapchat", difficulty: "low" },
];

router.get("/templates", (_req, res) => {
  res.json(TEMPLATES);
});

export default router;
