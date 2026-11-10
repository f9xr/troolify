/* ============================================================================
   Troolify - embed code generator pages (20 popular platforms)
   Generates tools/embed/<platform>-embed-code.html and registers each tool.
   Run: node troolify-gen/gen-embed-tools.js
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { buildPage, registerTools } = require('./tool-page-lib');

const ROOT = path.resolve(__dirname, '..');
const entries = [];

const platforms = [
  {
    key: 'tiktok',
    name: 'TikTok Embed Code Generator',
    file: 'tiktok-embed-code.html',
    icon: 'fa-brands fa-tiktok',
    title: 'TikTok Embed Code Generator - Free and No Uploads',
    metaDesc: 'Generate a TikTok embed code from any public video URL. Preview the post and copy the blockquote code - free, browser based, no sign-up.',
    desc: 'Turn a public TikTok video link into the official blockquote embed code, preview it live, and copy it in one click.',
    lead: 'TikTok videos get far more reach when they live on more than one page. The problem is that the share link is not embed code by itself. This generator turns a public TikTok URL into the exact blockquote plus script snippet TikTok expects, so you can drop a playable post into a blog, landing page, or store page without guessing at the markup.',
    embedType: 'blockquote plus TikTok embed script',
    size: '605px default width, 325px minimum',
    requirement: 'The video must be public and still available',
    placement: 'Blog posts, landing pages, product pages, newsletters and creator portfolios.',
    why: 'The generated code uses a blockquote with the video ID and cite URL, followed by TikTok\'s embed script. TikTok reads the blockquote when the page loads and replaces it with the player. The script only needs to appear once per page, even if you embed several videos.',
    useCases: [
      ['Creator portfolios', 'Show your best short-form videos beside your bio, services, and booking form.'],
      ['Product pages', 'Let shoppers watch a real demo without leaving the product page.'],
      ['Blog posts', 'Add context to an article with the original clip instead of a dead screenshot.']
    ],
    tips: [
      'Paste the URL from the video page, not a profile or search link.',
      'Keep the default width on mobile and let the player scale down.',
      'Do not paste the same TikTok script twice on one page.',
      'Recheck older embeds after a creator deletes or privatises a video.'
    ],
    troubleshoot: 'Private, deleted, region-locked, or age-restricted videos cannot be embedded. Open the video in a browser first and confirm it plays while logged out.',
    keywords: ['tiktok embed code', 'tiktok embed generator', 'embed tiktok video', 'tiktok video embed', 'tiktok embed code generator', 'embed tiktok on website', 'tiktok blockquote', 'social media embeds'],
    popular: true
  },
  {
    key: 'x',
    name: 'X (Twitter) Embed Code Generator',
    file: 'twitter-embed-code.html',
    icon: 'fa-brands fa-x-twitter',
    title: 'X (Twitter) Embed Code Generator - Free and Instant',
    metaDesc: 'Create an X or Twitter embed code from a post URL. Choose light or dark theme, hide replies, and copy the blockquote code instantly.',
    desc: 'Build the official X embed code for any public post, with theme and conversation options, then copy it in one click.',
    lead: 'Quoting a post is easy. Embedding the real post, with its author, media, and engagement, takes a little more care. This tool builds the standard X blockquote snippet for a public post URL and adds the theme and conversation controls the platform supports.',
    embedType: 'blockquote plus widgets.js',
    size: 'Responsive, up to the container width',
    requirement: 'The post must be public and still live',
    placement: 'News articles, brand pages, research notes, and social proof sections.',
    why: 'The blockquote stores the post URL. X\'s widgets script finds it on page load and upgrades it into a rendered post. The theme option switches the card between light and dark, and the conversation option hides replies when you want a tighter layout.',
    useCases: [
      ['Social proof', 'Show a genuine customer post next to a testimonial or case study.'],
      ['News and commentary', 'Preserve the original wording when you analyse a public post.'],
      ['Event coverage', 'Collect live reactions from speakers, attendees, and partners.']
    ],
    tips: [
      'Use the direct status URL, not a screenshot of the post.',
      'Keep replies hidden when space is tight.',
      'Load the widget script once per page.',
      'Check the post again before publishing a long-lived page.'
    ],
    troubleshoot: 'Protected accounts, deleted posts, and posts from blocked users will not render. If the card stays as plain text, another script may be stripping blockquotes or the widget script may be blocked.',
    keywords: ['twitter embed code', 'x embed code', 'twitter embed generator', 'embed tweet', 'x post embed', 'twitter blockquote', 'embed twitter on website', 'social media embeds'],
    popular: true
  },
  {
    key: 'youtube',
    name: 'YouTube Embed Code Generator',
    file: 'youtube-embed-code.html',
    icon: 'fa-brands fa-youtube',
    title: 'YouTube Embed Code Generator - Free and No Uploads',
    metaDesc: 'Generate a responsive YouTube iframe embed from any watch, youtu.be, shorts, or live URL. Set size and start time, then copy the code.',
    desc: 'Turn any YouTube link into a clean iframe embed with custom size and start time, then preview and copy it.',
    lead: 'YouTube gives you an embed button, but the code it produces is not always the size or shape you need. This generator accepts watch links, short links, shorts, live URLs, and existing embed URLs, then builds a tidy iframe with the options most publishers actually use.',
    embedType: 'iframe',
    size: '560 by 315 pixels default',
    requirement: 'The video must allow embedding',
    placement: 'Blog posts, documentation, course pages, and product demos.',
    why: 'The code points an iframe at youtube.com/embed with the video ID. The rel parameter limits related videos, and the optional start parameter jumps viewers to a specific second. The result is a lightweight embed that YouTube can update without you changing the page.',
    useCases: [
      ['Tutorials', 'Place the exact walkthrough beside the steps it explains.'],
      ['Product demos', 'Show the product in use without sending visitors to another tab.'],
      ['Course lessons', 'Embed a single lecture inside a lesson page with a known start time.']
    ],
    tips: [
      'Use a 16:9 frame unless the video was uploaded in another ratio.',
      'Set a start time for long videos so viewers skip the intro.',
      'Keep autoplay off; it is intrusive and often blocked by browsers.',
      'Check that embedding is enabled in the video\'s advanced settings.'
    ],
    troubleshoot: 'A video owner can disable embedding, make the video private, or restrict it by region. In those cases the player shows an error even though the code is correct.',
    keywords: ['youtube embed code', 'youtube embed generator', 'embed youtube video', 'youtube iframe', 'youtube embed code generator', 'embed youtube on website', 'responsive youtube embed', 'video embeds'],
    popular: true
  },
  {
    key: 'instagram',
    name: 'Instagram Embed Code Generator',
    file: 'instagram-embed-code.html',
    icon: 'fa-brands fa-instagram',
    title: 'Instagram Embed Code Generator - Free and Instant',
    metaDesc: 'Create an Instagram embed code for a public post, reel, or TV URL. Preview the card and copy the official blockquote snippet.',
    desc: 'Turn a public Instagram post, reel, or TV link into the official embed card, preview it live, and copy the code.',
    lead: 'Instagram embeds keep the post\'s images, caption, and author attribution intact. This generator accepts post, reel, and IGTV links, builds the standard blockquote card, and includes the embed script Instagram requires.',
    embedType: 'blockquote plus Instagram embed script',
    size: '540px maximum width, 326px minimum',
    requirement: 'The post or reel must be public',
    placement: 'Blog posts, lookbooks, restaurant menus, and campaign pages.',
    why: 'The blockquote carries the permalink in a data attribute. Instagram\'s embed script scans for that attribute, fetches the post, and replaces the fallback link with the rendered card. The card stays in sync with the original post as long as it remains public.',
    useCases: [
      ['Lookbooks', 'Show a styled post beside the products featured in it.'],
      ['Restaurants', 'Embed a reel of a signature dish on the menu page.'],
      ['Campaign recaps', 'Collect the best public posts from a launch or event.']
    ],
    tips: [
      'Paste the permalink, not the profile URL.',
      'Use one embed script per page, even with several posts.',
      'Keep a text fallback link for readers who block scripts.',
      'Avoid embedding posts that may be deleted soon.'
    ],
    troubleshoot: 'Private accounts, deleted posts, and some age-gated content will not render. Instagram may also ask logged-out readers to sign in before showing the post.',
    keywords: ['instagram embed code', 'instagram embed generator', 'embed instagram post', 'instagram reel embed', 'instagram blockquote', 'embed instagram on website', 'instagram iframe', 'social media embeds'],
    popular: true
  },
  {
    key: 'google-maps',
    name: 'Google Maps Embed Code Generator',
    file: 'google-maps-embed-code.html',
    icon: 'fa-solid fa-map-location-dot',
    title: 'Google Maps Embed Code Generator - Free and Easy',
    metaDesc: 'Generate a Google Maps iframe from a place link, share URL, or embed URL. Set the size, preview the map, and copy the code.',
    desc: 'Turn a Google Maps place or share link into a clean, responsive iframe map for your contact or location page.',
    lead: 'A map on a contact page answers the question customers ask most: where are you? This generator accepts Google Maps place links, share links, and existing embed URLs, then builds an iframe you can size and place without wrestling with the Maps interface.',
    embedType: 'iframe',
    size: '600 by 450 pixels default',
    requirement: 'A valid place, share, or embed URL',
    placement: 'Contact pages, store locators, event pages, and service area sections.',
    why: 'The code points an iframe at Google Maps with an output=embed parameter. When you paste a full place URL, the generator extracts the coordinates or the place query and builds a map centred on that location. Existing embed URLs are passed through unchanged.',
    useCases: [
      ['Contact pages', 'Show the exact entrance, parking, and surrounding streets.'],
      ['Multi-location businesses', 'Give each branch its own map and directions link.'],
      ['Event pages', 'Help attendees find a venue without opening a separate app.']
    ],
    tips: [
      'Use a place link rather than a search results page.',
      'Set a height that leaves room for the address and phone number.',
      'Add a text address and directions link beside the map.',
      'Recheck short share links before publishing; they can expire or change.'
    ],
    troubleshoot: 'Some short maps.app.goo.gl links do not expose coordinates to the tool. Open the short link first, then copy the full URL from the address bar and paste that instead.',
    keywords: ['google maps embed code', 'google maps embed generator', 'embed google maps', 'google maps iframe', 'google maps embed code generator', 'add map to website', 'location map embed', 'google maps html'],
    popular: true
  },
  {
    key: 'facebook',
    name: 'Facebook Embed Code Generator',
    file: 'facebook-embed-code.html',
    icon: 'fa-brands fa-facebook',
    title: 'Facebook Embed Code Generator - Free and No Uploads',
    metaDesc: 'Create a Facebook embed code for a public post, video, reel, or watch URL. Set the size, preview it, and copy the iframe code.',
    desc: 'Build a Facebook post or video embed from a public URL, with adjustable size and a live preview.',
    lead: 'Facebook posts and videos are often the first place a story appears. This generator turns a public post, video, reel, or watch URL into the correct Facebook plugin iframe, so you can quote the original without losing the media or the attribution.',
    embedType: 'iframe plugin',
    size: '500 by 620 pixels for posts, 500 by 476 for videos',
    requirement: 'The post or video must be public',
    placement: 'News articles, community pages, event recaps, and testimonial sections.',
    why: 'The code uses Facebook\'s post or video plugin endpoint, passing the source URL, width, height, and lazy loading flag. Facebook renders the card inside the iframe, so the embed keeps working when the post is edited, as long as it stays public.',
    useCases: [
      ['Community updates', 'Share an official announcement beside your own summary.'],
      ['Event recaps', 'Embed a video highlight from the day.'],
      ['Testimonials', 'Show a public customer post with its original context.']
    ],
    tips: [
      'Use the direct post or video URL, not a profile link.',
      'Pick the video plugin for videos and the post plugin for text posts.',
      'Leave lazy loading on for pages with several embeds.',
      'Test the embed while logged out to catch privacy issues.'
    ],
    troubleshoot: 'Only public content can be embedded. Posts from private groups, friends-only profiles, or restricted regions will show a blank frame or a login prompt.',
    keywords: ['facebook embed code', 'facebook embed generator', 'embed facebook post', 'facebook video embed', 'facebook iframe', 'embed facebook on website', 'facebook plugin code', 'social media embeds'],
    popular: true
  },
  {
    key: 'spotify',
    name: 'Spotify Embed Code Generator',
    file: 'spotify-embed-code.html',
    icon: 'fa-brands fa-spotify',
    title: 'Spotify Embed Code Generator - Free and Instant',
    metaDesc: 'Generate a Spotify embed code for a track, album, playlist, artist, episode, or show. Choose height and theme, then copy the iframe.',
    desc: 'Turn any Spotify share link into a playable iframe embed with the right height and theme.',
    lead: 'A Spotify embed lets visitors sample a track or playlist without leaving your page. This generator accepts track, album, playlist, artist, episode, and show links, then builds the official iframe with a sensible height and an optional dark theme.',
    embedType: 'iframe',
    size: '152px for tracks and episodes, 352px for albums and playlists',
    requirement: 'The track, album, playlist, or show must be public',
    placement: 'Music blogs, artist pages, podcast notes, and playlist roundups.',
    why: 'The iframe points at open.spotify.com/embed with the content type and ID from the share URL. Spotify handles playback, login prompts, and regional licensing inside the frame, so the embed code stays small and stable.',
    useCases: [
      ['Artist pages', 'Feature a latest release or a full discography playlist.'],
      ['Podcast notes', 'Embed the exact episode an article discusses.'],
      ['Playlist roundups', 'Let readers play a curated list in place.']
    ],
    tips: [
      'Use the share link from Spotify, not a copied browser URL with tracking parameters.',
      'Set 152px for a single track and 352px for a playlist or album.',
      'Use the dark theme on dark sites for a cleaner edge.',
      'Tell readers that full playback may require a Spotify account.'
    ],
    troubleshoot: 'Private playlists, region-restricted tracks, and removed episodes will not play. Spotify may also require a login for full tracks, even when the embed itself renders correctly.',
    keywords: ['spotify embed code', 'spotify embed generator', 'embed spotify playlist', 'spotify iframe', 'embed spotify track', 'spotify embed code generator', 'add spotify to website', 'music embeds'],
    popular: false
  },
  {
    key: 'canva',
    name: 'Canva Embed Code Generator',
    file: 'canva-embed-code.html',
    icon: 'fa-solid fa-palette',
    title: 'Canva Embed Code Generator - Free and Responsive',
    metaDesc: 'Turn a shared Canva design link into a responsive embed. Choose the aspect ratio, preview the design, and copy the iframe wrapper.',
    desc: 'Embed a shared Canva design with a responsive wrapper and the right aspect ratio for your page.',
    lead: 'Canva designs are often exported as images, which makes them hard to update and slow to load. Embedding the live design keeps it sharp and lets the owner edit it later. This generator builds the responsive iframe wrapper Canva recommends.',
    embedType: 'responsive iframe wrapper',
    size: 'Fluid width with 16:9, 4:3, 1:1, or 3:4 ratio',
    requirement: 'The design must be shared with a link or set to public',
    placement: 'Portfolios, presentations, pitch pages, and social media kits.',
    why: 'The wrapper uses a percentage padding trick to reserve space, then positions the iframe absolutely inside it. That keeps the design at the chosen ratio on any screen instead of squashing or cropping it.',
    useCases: [
      ['Pitch pages', 'Embed a live one-pager that the team can update after launch.'],
      ['Portfolios', 'Show a presentation or brand board at the correct ratio.'],
      ['Social kits', 'Give partners a viewable design without a download.']
    ],
    tips: [
      'Use the share link that starts with canva.com/design/.',
      'Match the ratio to the design canvas, not to the page layout.',
      'Set viewing permissions before you publish the embed.',
      'Keep a static fallback image for email and print.'
    ],
    troubleshoot: 'Private designs, expired share links, and designs restricted to a team will show a permissions error. Open the link in a private window to confirm it is viewable by the public.',
    keywords: ['canva embed code', 'canva embed generator', 'embed canva design', 'canva iframe', 'canva embed code generator', 'add canva to website', 'responsive canva embed', 'design embeds'],
    popular: false
  },
  {
    key: 'discord',
    name: 'Discord Embed Code Generator',
    file: 'discord-embed-code.html',
    icon: 'fa-brands fa-discord',
    title: 'Discord Embed Code Generator - Free Server Widget',
    metaDesc: 'Generate a Discord server widget embed from a server ID or widget iframe. Set size and theme, preview it, and copy the code.',
    desc: 'Build a live Discord server widget from a server ID or the widget code, with size and theme controls.',
    lead: 'A Discord widget shows who is online and gives visitors a direct way to join. This generator turns a server ID or an existing widget iframe into a clean, themeable embed you can place on a community or support page.',
    embedType: 'iframe widget',
    size: '350 by 500 pixels default',
    requirement: 'The server owner must enable Server Settings > Widget',
    placement: 'Community pages, support sites, gaming clans, and creator hubs.',
    why: 'The iframe points at discord.com/widget with the server ID and theme. Discord renders the member list and join button inside the frame. The server owner controls whether the widget is enabled and which channels are visible.',
    useCases: [
      ['Community pages', 'Show an active member count and a join button.'],
      ['Support sites', 'Give users a visible route to the help server.'],
      ['Creator hubs', 'Add a live community panel beside your content.']
    ],
    tips: [
      'Use the server ID, not an invite link.',
      'Enable the widget in Server Settings before publishing.',
      'Pick the theme that matches your page background.',
      'Keep the height tall enough for the member list.'
    ],
    troubleshoot: 'Invite links do not contain the server ID, so they cannot be converted. If the widget is disabled, the embed shows an error even with the correct ID.',
    keywords: ['discord embed code', 'discord widget embed', 'discord server widget', 'embed discord server', 'discord iframe', 'discord embed generator', 'discord widget code', 'community embeds'],
    popular: false
  },
  {
    key: 'reddit',
    name: 'Reddit Embed Code Generator',
    file: 'reddit-embed-code.html',
    icon: 'fa-brands fa-reddit-alien',
    title: 'Reddit Embed Code Generator - Free and No Uploads',
    metaDesc: 'Create a Reddit embed code from a public post URL. Set the height, preview the thread, and copy the blockquote snippet.',
    desc: 'Turn a public Reddit post into the official embed, with a height control and a live preview.',
    lead: 'Reddit threads often contain the most useful discussion of a topic. Embedding the post preserves the original question, the top comments, and the community context. This generator builds the standard blockquote and widget script for a public post URL.',
    embedType: 'blockquote plus Reddit widget script',
    size: '500px default height, 160px to 1200px',
    requirement: 'The post must be public and not quarantined',
    placement: 'Research notes, community roundups, and commentary articles.',
    why: 'The blockquote stores the post URL and a height hint. Reddit\'s widget script replaces it with an interactive card that includes the post and top comments. The height control keeps the card from dominating the page.',
    useCases: [
      ['Research notes', 'Keep the original discussion next to your analysis.'],
      ['Community roundups', 'Feature a useful thread without copying every comment.'],
      ['Product feedback', 'Show a public discussion about a feature or issue.']
    ],
    tips: [
      'Use the permalink from the post, not the subreddit URL.',
      'Set a height that shows the post and the first few comments.',
      'Avoid embedding quarantined or NSFW communities on general pages.',
      'Add your own summary above the embed for readers who skip it.'
    ],
    troubleshoot: 'Private, quarantined, removed, or NSFW posts may not render for every reader. If the card stays as a plain link, the widget script may have been blocked or loaded twice.',
    keywords: ['reddit embed code', 'reddit embed generator', 'embed reddit post', 'reddit blockquote', 'reddit widget', 'embed reddit on website', 'reddit iframe', 'community embeds'],
    popular: false
  },
  {
    key: 'vimeo',
    name: 'Vimeo Embed Code Generator',
    file: 'vimeo-embed-code.html',
    icon: 'fa-brands fa-vimeo',
    title: 'Vimeo Embed Code Generator - Free and Responsive',
    metaDesc: 'Generate a Vimeo iframe embed from any video URL. Choose the size, preview the player, and copy clean responsive code.',
    desc: 'Turn a Vimeo video link into a clean iframe embed with custom size and a live preview.',
    lead: 'Vimeo is the default choice for filmmakers, agencies, and course creators who care about presentation. This generator takes a Vimeo video URL, extracts the numeric ID, and builds an iframe with the chrome removed so the video stays the focus.',
    embedType: 'iframe',
    size: '640 by 360 pixels default',
    requirement: 'The video must allow embedding',
    placement: 'Portfolios, course pages, agency case studies, and film pages.',
    why: 'The iframe points at player.vimeo.com/video with the video ID. Query parameters hide the title, byline, and portrait so the player looks clean inside your layout. Vimeo handles the streaming and adaptive quality.',
    useCases: [
      ['Portfolios', 'Show a reel or a single film without Vimeo branding around it.'],
      ['Course pages', 'Embed a lesson with a clean, distraction-free frame.'],
      ['Case studies', 'Pair a client video with the written results.']
    ],
    tips: [
      'Use the numeric video URL, not a showcase or profile link.',
      'Keep the 16:9 ratio unless the video was shot vertically.',
      'Check the video\'s privacy settings before publishing.',
      'Add a transcript or summary for accessibility and SEO.'
    ],
    troubleshoot: 'Videos with domain-level privacy restrictions will only play on approved domains. Removed or password-protected videos show an error inside the player.',
    keywords: ['vimeo embed code', 'vimeo embed generator', 'embed vimeo video', 'vimeo iframe', 'vimeo embed code generator', 'embed vimeo on website', 'responsive vimeo embed', 'video embeds'],
    popular: false
  },
  {
    key: 'soundcloud',
    name: 'SoundCloud Embed Code Generator',
    file: 'soundcloud-embed-code.html',
    icon: 'fa-brands fa-soundcloud',
    title: 'SoundCloud Embed Code Generator - Free and Instant',
    metaDesc: 'Create a SoundCloud embed code for a track or playlist. Set the height and accent colour, preview the player, and copy the iframe.',
    desc: 'Turn a SoundCloud track or playlist link into a themed player embed with a live preview.',
    lead: 'SoundCloud players are compact, familiar, and easy to theme. This generator accepts track and playlist URLs, builds the official player iframe, and lets you set the height and accent colour so the player fits your site.',
    embedType: 'iframe',
    size: '166px default height, 120px to 450px',
    requirement: 'The track or playlist must be public',
    placement: 'Music blogs, artist pages, podcast notes, and label catalogues.',
    why: 'The iframe points at the SoundCloud player with the track URL and display options encoded as query parameters. The accent colour changes the play button and progress bar, which helps the player match your brand.',
    useCases: [
      ['Artist pages', 'Feature a single or a full playlist in a compact player.'],
      ['Music blogs', 'Let readers preview a track while they read the review.'],
      ['Podcast notes', 'Embed a public episode with show notes beside it.']
    ],
    tips: [
      'Use the track or playlist URL, not the profile page.',
      'Keep the height near 166px for a standard track player.',
      'Pick an accent colour with enough contrast against the player.',
      'Check that the track is public before publishing.'
    ],
    troubleshoot: 'Private tracks require a secret link and may still fail for some readers. Removed tracks and region-locked content will show an empty player.',
    keywords: ['soundcloud embed code', 'soundcloud embed generator', 'embed soundcloud track', 'soundcloud iframe', 'soundcloud player embed', 'embed soundcloud playlist', 'soundcloud embed code generator', 'music embeds'],
    popular: false
  },
  {
    key: 'twitch',
    name: 'Twitch Embed Code Generator',
    file: 'twitch-embed-code.html',
    icon: 'fa-brands fa-twitch',
    title: 'Twitch Embed Code Generator - Free and Responsive',
    metaDesc: 'Generate a Twitch embed for a channel, video, or clip. Set the parent domain, size, and autoplay, then copy the iframe code.',
    desc: 'Embed a live Twitch channel, VOD, or clip with the required parent domain and player options.',
    lead: 'Twitch embeds are strict about one thing: the parent domain. If it does not match the site hosting the player, the embed refuses to load. This generator asks for that domain, then builds the correct iframe for a channel, video, or clip.',
    embedType: 'iframe',
    size: '800 by 450 pixels default',
    requirement: 'The parent domain must match the hosting site',
    placement: 'Gaming sites, creator pages, event hubs, and community portals.',
    why: 'The iframe points at player.twitch.tv or clips.twitch.tv with the channel, video, or clip identifier. Twitch compares the parent parameter with the page\'s domain before serving the player. Autoplay, when enabled, starts muted because browsers block unmuted autoplay.',
    useCases: [
      ['Creator pages', 'Show a live channel beside a schedule and donation links.'],
      ['Event hubs', 'Embed a tournament stream on the event page.'],
      ['Clip roundups', 'Feature the best moments from a stream.']
    ],
    tips: [
      'Enter the domain without https:// or a path.',
      'Use the channel name for live streams, not the full URL.',
      'Keep autoplay off unless the player is muted.',
      'Test the embed on the exact domain you entered.'
    ],
    troubleshoot: 'If the player is blank, the parent domain is usually wrong or includes www when the live site does not. Clips and videos use different URL patterns, so paste the URL rather than only the channel name when possible.',
    keywords: ['twitch embed code', 'twitch embed generator', 'embed twitch channel', 'twitch iframe', 'twitch player embed', 'embed twitch stream', 'twitch clip embed', 'streaming embeds'],
    popular: false
  },
  {
    key: 'linkedin',
    name: 'LinkedIn Embed Code Generator',
    file: 'linkedin-embed-code.html',
    icon: 'fa-brands fa-linkedin',
    title: 'LinkedIn Embed Code Generator - Free and No Uploads',
    metaDesc: 'Create a LinkedIn post embed from a public post URL or the Embed this post code. Set the size, preview it, and copy the iframe.',
    desc: 'Turn a public LinkedIn post into an embeddable card with a clean iframe and adjustable size.',
    lead: 'LinkedIn posts carry professional context that a screenshot cannot. This generator extracts the post ID from a public URL or an existing embed snippet and builds the official feed iframe, so the post renders with its author, text, and media.',
    embedType: 'iframe',
    size: '504 by 600 pixels default',
    requirement: 'The post must be public',
    placement: 'Company pages, case studies, hiring pages, and industry commentary.',
    why: 'The iframe points at linkedin.com/embed/feed/update with the post URN. LinkedIn renders the post card inside the frame. If the URL does not contain an activity ID, the generator can read the URN from the full Embed this post snippet.',
    useCases: [
      ['Company pages', 'Feature an announcement or a team milestone.'],
      ['Case studies', 'Show a public client post beside the results.'],
      ['Hiring pages', 'Embed a post from a team member about the role.']
    ],
    tips: [
      'Use the post URL or the full Embed this post code.',
      'Keep the width near 504px for the standard card.',
      'Check that the author has not restricted the post after publishing.',
      'Add a short summary above the embed for readers who do not scroll.'
    ],
    troubleshoot: 'Only public posts can be embedded. If the URL has no activity ID, open the post menu, choose Embed this post, and paste the full snippet into the URL field.',
    keywords: ['linkedin embed code', 'linkedin embed generator', 'embed linkedin post', 'linkedin iframe', 'linkedin post embed', 'embed linkedin on website', 'linkedin embed code generator', 'professional embeds'],
    popular: false
  },
  {
    key: 'pinterest',
    name: 'Pinterest Embed Code Generator',
    file: 'pinterest-embed-code.html',
    icon: 'fa-brands fa-pinterest',
    title: 'Pinterest Embed Code Generator - Free and Instant',
    metaDesc: 'Generate a Pinterest pin embed from a public pin URL. Choose the pin size, preview it, and copy the link plus script code.',
    desc: 'Turn a public Pinterest pin into an embeddable card with a size control and a live preview.',
    lead: 'Pinterest pins are visual, linkable, and easy to save. This generator builds the official pin embed markup, including the data attributes Pinterest reads and the pinit.js script that turns the link into a card.',
    embedType: 'link plus pinit.js',
    size: 'Small, medium, or large pin width',
    requirement: 'The pin must be public',
    placement: 'Recipe blogs, wedding pages, home decor sites, and product roundups.',
    why: 'The markup is an anchor with data-pin-do and data-pin-width attributes. Pinterest\'s script finds that anchor and renders the pin card. Keeping the fallback link means readers still reach the pin if the script is blocked.',
    useCases: [
      ['Recipe blogs', 'Embed the original pin for a dish or ingredient list.'],
      ['Home decor', 'Show a room inspiration pin beside a shopping list.'],
      ['Product roundups', 'Let readers save a pin for later without leaving the page.']
    ],
    tips: [
      'Use the pin URL that contains /pin/ and the numeric ID.',
      'Pick the pin size that fits your column width.',
      'Load pinit.js once per page.',
      'Avoid secret boards and pins that may be deleted.'
    ],
    troubleshoot: 'Secret pins and pins from deleted boards cannot be embedded. If the card stays as a text link, the pinit.js script may be missing or blocked.',
    keywords: ['pinterest embed code', 'pinterest embed generator', 'embed pinterest pin', 'pinterest widget', 'pinterest pin embed', 'embed pinterest on website', 'pinterest embed code generator', 'visual embeds'],
    popular: false
  },
  {
    key: 'telegram',
    name: 'Telegram Embed Code Generator',
    file: 'telegram-embed-code.html',
    icon: 'fa-brands fa-telegram',
    title: 'Telegram Embed Code Generator - Free and No Uploads',
    metaDesc: 'Create a Telegram post embed from a public t.me link. Set the width, preview the post, and copy the widget script code.',
    desc: 'Turn a public Telegram post link into the official widget embed with a width control.',
    lead: 'Telegram channels are increasingly used for announcements and community updates. This generator converts a public t.me post link into the official Telegram widget, so readers can view the post without opening the app.',
    embedType: 'script widget',
    size: '100% width by default',
    requirement: 'The channel must be public',
    placement: 'Crypto and news sites, community pages, and announcement feeds.',
    why: 'The code is a script tag with a data-telegram-post attribute. Telegram\'s widget script reads that attribute and renders the post inside an iframe. The width can be a percentage or a pixel value.',
    useCases: [
      ['Announcement feeds', 'Mirror a public channel post on a news page.'],
      ['Community pages', 'Show the latest public update from a group.'],
      ['Crypto projects', 'Embed a public team announcement with its original formatting.']
    ],
    tips: [
      'Use a link in the form t.me/channel/123.',
      'Keep the width at 100% for mobile-friendly layouts.',
      'Only public channels can be embedded.',
      'Check that the post has not been deleted before publishing.'
    ],
    troubleshoot: 'Private channels, secret chats, and deleted posts cannot be embedded. If the widget is blank, confirm the channel is public and the post number is correct.',
    keywords: ['telegram embed code', 'telegram embed generator', 'embed telegram post', 'telegram widget', 'telegram post embed', 'embed telegram on website', 'telegram embed code generator', 'messaging embeds'],
    popular: false
  },
  {
    key: 'imgur',
    name: 'Imgur Embed Code Generator',
    file: 'imgur-embed-code.html',
    icon: 'fa-solid fa-image',
    title: 'Imgur Embed Code Generator - Free and Instant',
    metaDesc: 'Generate an Imgur embed code for an image, album, or gallery. Preview it and copy the official blockquote plus script snippet.',
    desc: 'Turn an Imgur image, album, or gallery link into an embeddable post card with a live preview.',
    lead: 'Imgur links are everywhere in forums, guides, and community posts. This generator turns a public image, album, or gallery URL into the official Imgur embed block, so the media renders inside your page instead of sending readers away.',
    embedType: 'blockquote plus Imgur embed script',
    size: 'Responsive, sized by Imgur',
    requirement: 'The image or gallery must be public',
    placement: 'Guides, forums, community pages, and documentation.',
    why: 'The blockquote carries the Imgur content ID. Imgur\'s embed script scans for it and replaces the fallback link with the media card. Albums and galleries keep their navigation and captions.',
    useCases: [
      ['Guides', 'Embed a screenshot gallery without re-uploading every image.'],
      ['Community pages', 'Show a public album from an event.'],
      ['Documentation', 'Keep a set of reference images in one embeddable card.']
    ],
    tips: [
      'Use the gallery, album, or image URL, not a direct image file.',
      'Load the Imgur script once per page.',
      'Check that the album is public, not hidden.',
      'Add a short caption for readers who block third-party scripts.'
    ],
    troubleshoot: 'Deleted, private, or hidden Imgur posts will not render. Direct i.imgur.com image links are not the same as gallery links; use the page URL instead.',
    keywords: ['imgur embed code', 'imgur embed generator', 'embed imgur image', 'imgur album embed', 'imgur gallery embed', 'embed imgur on website', 'imgur blockquote', 'image embeds'],
    popular: false
  },
  {
    key: 'giphy',
    name: 'GIPHY Embed Code Generator',
    file: 'giphy-embed-code.html',
    icon: 'fa-solid fa-film',
    title: 'GIPHY Embed Code Generator - Free and Responsive',
    metaDesc: 'Create a GIPHY embed code from a GIF page or embed URL. Set the size, preview the animation, and copy the iframe plus attribution.',
    desc: 'Turn a GIPHY link into a sized iframe with the standard attribution link and a live preview.',
    lead: 'GIFs add tone and motion to a page, but copying the raw image file loses attribution and can break when GIPHY updates the asset. This generator builds the official iframe embed with the standard via GIPHY credit.',
    embedType: 'iframe plus attribution link',
    size: '480 by 270 pixels default',
    requirement: 'The GIF must be public and still on GIPHY',
    placement: 'Blog posts, chat roundups, social pages, and help articles.',
    why: 'The iframe points at giphy.com/embed with the GIF ID. GIPHY serves the animation and handles the file format. The attribution link below the frame keeps the credit visible and links back to the source.',
    useCases: [
      ['Blog posts', 'Add a reaction or explainer GIF with proper credit.'],
      ['Help articles', 'Show a short looping demonstration.'],
      ['Social pages', 'Feature a branded GIF from a campaign.']
    ],
    tips: [
      'Use the GIF page URL, not the direct media file.',
      'Keep the original aspect ratio to avoid letterboxing.',
      'Leave the attribution link in place.',
      'Check the GIF again before publishing a long-lived page.'
    ],
    troubleshoot: 'GIPHY removes content that violates its policies, which leaves an empty frame. If the URL is a direct media link, the generator may not find the ID; use the page URL instead.',
    keywords: ['giphy embed code', 'giphy embed generator', 'embed giphy gif', 'giphy iframe', 'gif embed code', 'embed gif on website', 'giphy embed code generator', 'animation embeds'],
    popular: false
  },
  {
    key: 'apple-music',
    name: 'Apple Music Embed Code Generator',
    file: 'apple-music-embed-code.html',
    icon: 'fa-brands fa-apple',
    title: 'Apple Music Embed Code Generator - Free and Instant',
    metaDesc: 'Generate an Apple Music embed from an album, playlist, song, or music video URL. Choose the height, preview it, and copy the iframe.',
    desc: 'Turn an Apple Music link into a themed player embed with the right height and a live preview.',
    lead: 'Apple Music embeds are clean and recognizable, which makes them a good fit for artist pages, release notes, and music journalism. This generator extracts the region, content type, and ID from a share link, then builds the official embed iframe.',
    embedType: 'iframe',
    size: '450px for albums and playlists, 175px for songs',
    requirement: 'The content must be available in the link\'s region',
    placement: 'Artist pages, album reviews, release notes, and playlist roundups.',
    why: 'The iframe points at embed.music.apple.com with the region, content type, and ID. Apple serves the player and handles previews, subscriptions, and regional availability inside the frame.',
    useCases: [
      ['Album reviews', 'Let readers hear the record while they read the review.'],
      ['Artist pages', 'Feature the latest release with a full album player.'],
      ['Playlist roundups', 'Embed a curated Apple Music playlist in place.']
    ],
    tips: [
      'Use the share link from Apple Music, including the country code.',
      'Set 450px for albums and playlists, 175px for a single song.',
      'Check that the release is available in the link\'s region.',
      'Keep the player width under 660px for the cleanest layout.'
    ],
    troubleshoot: 'Tracks that are not available in the link\'s region may show as unavailable. Full playback usually requires an Apple Music subscription, but the player itself should still render.',
    keywords: ['apple music embed code', 'apple music embed generator', 'embed apple music', 'apple music iframe', 'apple music player embed', 'embed apple music playlist', 'apple music embed code generator', 'music embeds'],
    popular: false
  },
  {
    key: 'mastodon',
    name: 'Mastodon Embed Code Generator',
    file: 'mastodon-embed-code.html',
    icon: 'fa-brands fa-mastodon',
    title: 'Mastodon Embed Code Generator - Free and No Uploads',
    metaDesc: 'Create a Mastodon embed code from a public post URL on any instance. Set the height, preview the post, and copy the iframe.',
    desc: 'Turn a public Mastodon post link from any instance into a clean embed with a live preview.',
    lead: 'Mastodon is decentralised, so a post URL can live on almost any domain. This generator reads the instance, user, and post ID from the URL and builds the standard /embed iframe, without assuming a single server.',
    embedType: 'iframe',
    size: '400px default height, 160px to 900px',
    requirement: 'The instance must allow embedding',
    placement: 'Community pages, tech blogs, fediverse guides, and news articles.',
    why: 'The iframe points at the post\'s own instance with /embed appended. The instance renders the post, media, and interactions. Because each instance controls embedding, the same code can work on one server and fail on another.',
    useCases: [
      ['Fediverse guides', 'Show a real public post as an example.'],
      ['Tech blogs', 'Quote a public discussion with its original context.'],
      ['Community pages', 'Embed an announcement from a public account.']
    ],
    tips: [
      'Use the full post URL, including the instance domain.',
      'Check that the instance has embeds enabled.',
      'Keep the height tall enough for media and replies.',
      'Add a text link as a fallback for readers who block iframes.'
    ],
    troubleshoot: 'Some instances disable embeds for privacy or moderation reasons. If the frame is blank, the post may be private, deleted, or hosted on an instance that blocks embedding.',
    keywords: ['mastodon embed code', 'mastodon embed generator', 'embed mastodon post', 'mastodon iframe', 'mastodon post embed', 'embed mastodon on website', 'fediverse embed', 'social media embeds'],
    popular: false
  }
];

function articleFor(p) {
  const label = p.sourceName || p.name.replace(' Embed Code Generator', '');
  const faq = [
    [`Is the ${p.name.replace(' Generator', '')} free to use?`, `Yes. The Troolify generator is free, needs no account, and runs in your browser. You can build and copy as many embeds as you need.`],
    [`Do I have to upload the ${label} link?`, `No. The tool reads the link in your browser and builds the code locally. Nothing you paste is sent to a server.`],
    [`Does the embed work on mobile?`, `Yes, as long as the platform allows the content to be embedded. The generated code uses the platform's player or card, which adapts to the screen size.`],
    [`Why is my embed not showing?`, p.troubleshoot],
    [`Can I change the size after copying the code?`, `Yes. Edit the width and height values in the iframe, or adjust the wrapper CSS. Keep the aspect ratio close to the original to avoid empty space or cropping.`]
  ];

  return {
    title: p.title,
    lead: `<p>${p.lead}</p><p>Everything below runs in your browser. Paste the link, adjust the options, preview the result, and copy the code. No sign-up, no upload, no server round trip.</p>`,
    sections: [
      {
        id: 'what',
        heading: `What is a ${p.name.replace(' Generator', '')}?`,
        icon: 'fa-solid fa-circle-info',
        html: `<p>It is a small browser tool that builds embeddable markup for ${label} content. You provide a public link. The tool validates it and writes the ${p.embedType} code you can paste into your site.</p><p>This is safer than copying a random snippet from a forum, and faster than reading the platform's developer documentation every time you need an embed.</p>`
      },
      {
        id: 'where',
        heading: `Where you can use ${label} embeds`,
        icon: 'fa-solid fa-location-dot',
        html: `<p>${p.placement}</p><p>The generated code works in WordPress Custom HTML blocks, Shopify's HTML view, Wix embeds, Squarespace code blocks, static site generators, and hand-written HTML. If your editor accepts an iframe or a script tag, it can accept this embed.</p>`
      },
      {
        id: 'how-it-works',
        heading: 'How the generated code works',
        icon: 'fa-solid fa-code',
        html: `<p>This tool produces ${p.embedType}. ${p.why}</p><p>Typical size: ${p.size}. Requirement: ${p.requirement}.</p>`
      }
    ],
    steps: [
      `Open the tool and paste the public ${label} link.`,
      'Adjust the size, theme, or player options to match your page.',
      'Check the live preview and fix any error message the tool shows.',
      'Copy the generated code and paste it into your site, then publish and test on a phone.'
    ],
    facts: [
      ['Embed type', p.embedType],
      ['Typical size', p.size],
      ['Requirement', p.requirement],
      ['Data handling', '100% in your browser'],
      ['Account needed', 'No'],
      ['Price', 'Free']
    ],
    useCases: p.useCases,
    tips: p.tips,
    takeaways: [
      `Use the public link from the original ${label} page, not a profile or search result.`,
      'Preview the embed before publishing; a correct code can still fail if the content is private.',
      'Keep the generated size close to the platform default for the best layout.',
      'Test on a phone and keep a plain link as a fallback.',
      'Recheck long-lived embeds when the original post changes or disappears.'
    ],
    faq,
    conclusion: `<p>Paste the link, check the preview, and copy the code. That is the whole workflow. If you need more browser-based utilities, browse the <a href="../../tools/">Troolify tools hub</a>.</p>`
  };
}

function add(p) {
  const spec = {
    name: p.name,
    folder: 'embed',
    file: p.file,
    tag: 'Embed',
    catName: 'Embed',
    icon: p.icon,
    desc: p.desc,
    metaDesc: p.metaDesc,
    title: p.title,
    badge: '100% client-side &middot; zero data retention',
    featureList: [
      'Accepts a link or the full embed code',
      'Live preview before you copy',
      'One-click copy',
      'No sign-up or account',
      '100% client-side processing'
    ],
    keywords: p.keywords,
    css: '',
    js: '',
    extraHead: '<link rel="stylesheet"href="../../assets/css/embed-tools.min.css">',
    scripts: '<script src="../../assets/js/embed-tools.min.js"defer></script>',
    bodyAttrs: 'data-embed-platform="' + p.key + '"',
    panel: '<div class="panel clean"><div class="panel-inner"><div id="embedTool"></div></div></div>',
    article: articleFor(p)
  };

  const page = buildPage(spec);
  const dir = path.join(ROOT, 'tools', spec.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, spec.file), page);
  entries.push({
    name: spec.name,
    desc: spec.desc,
    icon: spec.icon,
    tag: spec.tag,
    category: spec.catName,
    href: 'tools/' + spec.folder + '/' + spec.file,
    keywords: spec.keywords,
    recent: true,
    popular: !!p.popular
  });
}

const newsBrands = [
  { key: 'abc-news', brand: 'ABC News', domain: 'abcnews.go.com', icon: 'fa-solid fa-newspaper' },
  { key: 'bbc', brand: 'BBC', domain: 'bbc.com', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'bloomberg', brand: 'Bloomberg', domain: 'bloomberg.com', icon: 'fa-solid fa-chart-line' },
  { key: 'business-insider', brand: 'Business Insider', domain: 'businessinsider.com', icon: 'fa-solid fa-briefcase' },
  { key: 'buzzfeed', brand: 'BuzzFeed', domain: 'buzzfeed.com', icon: 'fa-solid fa-bolt' },
  { key: 'cbc', brand: 'CBC', domain: 'cbc.ca', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'cbs-news', brand: 'CBS News', domain: 'cbsnews.com', icon: 'fa-solid fa-circle-play' },
  { key: 'cnbc', brand: 'CNBC', domain: 'cnbc.com', icon: 'fa-solid fa-chart-line' },
  { key: 'cnn', brand: 'CNN', domain: 'cnn.com', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'fox-news', brand: 'Fox News', domain: 'foxnews.com', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'global-news', brand: 'Global News', domain: 'globalnews.ca', icon: 'fa-solid fa-globe' },
  { key: 'msnbc', brand: 'MSNBC', domain: 'msnbc.com', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'nbc-news', brand: 'NBC News', domain: 'nbcnews.com', icon: 'fa-solid fa-tower-broadcast' },
  { key: 'new-york-times', brand: 'New York Times', domain: 'nytimes.com', icon: 'fa-solid fa-newspaper' },
  { key: 'npr', brand: 'NPR', domain: 'npr.org', icon: 'fa-solid fa-microphone-lines' },
  { key: 'reuters', brand: 'Reuters', domain: 'reuters.com', icon: 'fa-solid fa-globe' },
  { key: 'the-independent', brand: 'The Independent', domain: 'independent.co.uk', icon: 'fa-solid fa-newspaper' },
  { key: 'usa-today', brand: 'USA TODAY', domain: 'usatoday.com', icon: 'fa-solid fa-newspaper' },
  { key: 'washington-post', brand: 'Washington Post', domain: 'washingtonpost.com', icon: 'fa-solid fa-landmark' },
  { key: 'wall-street-journal', brand: 'Wall Street Journal', domain: 'wsj.com', icon: 'fa-solid fa-chart-line' }
];

const newsPlatforms = newsBrands.map(function (b) {
  const lower = b.brand.toLowerCase();
  return {
    key: b.key,
    name: b.brand + ' Embed Code Generator',
    file: b.key + '-embed-code.html',
    icon: b.icon,
    sourceName: b.brand,
    title: b.brand + ' Embed Code Generator - Free Link Card Embed',
    metaDesc: 'Create a ' + b.brand + ' embed code from a public article or video URL. Preview the branded link card and copy the HTML - free, no sign-up.',
    desc: 'Turn a public ' + b.brand + ' story link into a branded embed card, preview it, and copy the code.',
    lead: 'A ' + b.brand + ' link is useful only when readers can see where it goes. This generator turns a public ' + b.domain + ' article or video URL into a branded card that names the publisher, shows the destination, and fits any layout. It is the honest way to cite a story when the publisher does not allow a full-page iframe.',
    embedType: 'branded link card',
    size: '600px default max width, responsive down to mobile',
    requirement: 'A public ' + b.domain + ' article or video URL',
    placement: 'News roundups, blog posts, research notes, community pages, and newsletters.',
    why: 'The generated code is a small anchor card with the ' + b.brand + ' name, mark, and destination URL. Most news publishers block full-page iframes with frame-ancestors or X-Frame-Options, so a card is the reliable way to cite a story without implying the article lives on your site.',
    useCases: [
      ['News roundups', 'Point readers to the original ' + b.brand + ' reporting beside your summary.'],
      ['Research notes', 'Keep a readable citation without copying the full article.'],
      ['Community pages', 'Share a story with a clear destination and visible source.']
    ],
    tips: [
      'Use the canonical article URL, not an AMP, tracking, or share URL.',
      'Keep the card under 600px in narrow sidebars and email layouts.',
      'Leave the destination URL visible so readers know they are leaving your site.',
      'Recheck subscriber-only or archived stories before publishing.'
    ],
    troubleshoot: 'Only public ' + b.brand + ' pages can be linked. Removed stories, subscriber-only articles, and region locks may show a paywall or error on ' + b.domain + '.',
    keywords: [lower + ' embed code', lower + ' embed generator', 'embed ' + lower + ' article', lower + ' link card', 'news embed code', 'embed news article', 'publisher embed', 'news link card'],
    popular: false
  };
});

const selected = process.argv.includes('--news') ? newsPlatforms : platforms;
selected.forEach(add);
const reg = registerTools(entries);
console.log('Embed tools created:', entries.length, 'registered:', reg.added, 'skipped:', reg.skipped);
