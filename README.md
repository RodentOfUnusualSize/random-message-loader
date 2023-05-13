# Random message loader

[![Release][release-shield]][release-url]
[![GitHub top language][language-shield]][repo-url]
[![GPLv3][license-shield]][license-url]
[![standard-readme compliant][std-readme-shield]][std-readme-url]

Sets content to a randomly-selected message loaded from a URL.

This is a simple Javascript program to load messages from a URL, select one at random, and then insert it into an element on a web page.
It supports loading messages into multiple elements, from multiple URLs.

This program was written as a learning exercise.


## Table of Contents

-   [Security](#security)
    -   [Reporting vulnerabilities](#reporting-vulnerabilities)
-   [Install](#install)
-   [Usage](#usage)
-   [Contributing](#contributing)
-   [License](#license)


## Security

**Note: This project is a work in progress. Security concerns may change wildly as the project progresses.**

This program loads a text file containing messages from a URL, and then sets the content of a web page element to a randomly-selected message from that file.

The two key points of concern are:

1.  the request; and
2.  the content of the message.

If an attacker can control or intercept the request, they could:

*   get information about who is viewing the host page
*   perform any attack possible with requested content (such as serving an infinite response to choke up a client as a denial of service attack)
*   block the message content; or
*   replace the message content.

Messages may contain (X)HTML or other mark-up, which is then inserted into the host page without any checking or sanitization.
If a message contains malicious content, it may exploit browser vulnerabilities and allow further attacks.

The following steps should always be taken to protect against exploits:

*   Always serve both the host web page and the messages file securely.
*   Use [Content Security Policy directives][csp] to protect against cross-site scripting or data-injection attacks.


### Reporting vulnerabilities

If you discover any security vulnerabilities or concerns, please use [the GitHub security vulnerability reporting utility][security-report-url].

See also [the project security policy][security-policy-url].


## Install

This program is a single file Javascript program.

To use it, just copy the [`random-message-loader.js` script file][script] to where you would like it to be served from on your web server.
No other installation is necessary.


## Usage

To display randomly-selected messages on a web page, you need four things:

1.  The [`random-message-loader.js` program][script], served from somewhere on your web server.
2.  A file containing the messages, served from somewhere on your web server.
3.  A `<script>` element in the web page to load the program.
4.  A `data-saria-random-message-src` attribute on the element(s) in the web page you want filled with random content.

The message file is a simple text file.
Each message is its own line in the file.

An example message file:

```text
This is the first message!
This is message #2!
The <em>third</em> message (yes, messages can contain markup).
```

Any web page that wants to use random messages must include the script file with a `<script>` tag.
You might want to use the `async` attribute so that loading the script does not delay loading the page.

Once a web page has included the script, you may use the `data-saria-random-message-src` attribute for any element you wish to include randomly-selected content.
The value of the attribute is the URL you want to load the messages from.

An example web page:

```html
<!DOCTYPE html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
	<meta charset="utf-8"/>
	<title>Example page</title>
	<script src="/path/to/random-message-loader.js" async=""></script>
</head>
<body>
  <h1>Example page</h1>
  <p>The following paragraph will have a randomly-selected message:</p>
  <p data-saria-random-message-src="/path/to/messages.txt"></p>
</body>
</html>
```

Once you have included the script in a page, you can generate as much randomly-selected content from as many URLs as you like:

```html
<!DOCTYPE html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
	<meta charset="utf-8"/>
	<title>Example page</title>
	<script src="/path/to/random-message-loader.js" async=""></script>
</head>
<body>
  <h1>Example page</h1>
  <p>The following paragraph will have a randomly-selected message:</p>
  <p data-saria-random-message-src="/path/to/messages.txt"></p>
  <p>The following paragraph will have another randomly-selected message from the same set of messages as above (it may produce the same message, or not; it’s random!):</p>
  <p data-saria-random-message-src="/path/to/messages.txt"></p>
  <p>The following paragraph will have a randomly-selected message from a different set of messages:</p>
  <p data-saria-random-message-src="/path/to/other-messages.txt"></p>
</body>
</html>
```

Any existing content will be replaced by the randomly-selected message.
This means you can provide “default content” that will be displayed before the messages load, and in case they never do (for example, if there is a failure retriving the message file from the URL).


## Contributing

**Contributions are currently not being accepted.**

This project is a learning exercise, and accepting contributions this early would defeat the purpose.

Contributions will be accepted at a later date.
Instructions and guidelines for contributing will be available at that time.


## License

GNU General Public License v3.0 or later

Copyright © 2023 Saria Mistry

This is free software: you are free to change and redistribute it.
There is **NO WARRANTY**, to the extent permitted by law.

See [the project licence file][license-url] for details.


[repo-url]: https://github.com/RodentOfUnusualSize/random-message-loader
[release-url]: https://github.com/RodentOfUnusualSize/random-message-loader/releases
[security-report-url]: https://github.com/RodentOfUnusualSize/random-message-loader/security
[release-shield]: https://img.shields.io/github/v/release/RodentOfUnusualSize/random-message-loader?include_prereleases&sort=semver
[language-shield]: https://img.shields.io/github/languages/top/RodentOfUnusualSize/random-message-loader.svg
[license-shield]: https://img.shields.io/github/license/RodentOfUnusualSize/random-message-loader.svg
[std-readme-shield]: https://img.shields.io/badge/readme%20style-standard-brightgreen.svg
[std-readme-url]: https://github.com/RichardLitt/standard-readme
[license-url]: ../LICENSE
[security-policy-url]: ../SECURITY.md
[script]: ../random-message-loader.js
[csp]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
