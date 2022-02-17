# Core URL API

It is a small Node.js API that transform URLs into small urls and make the redirection.

It uses Node.js, PostgreSQL, and Docker.

## Methods:

`GET /:code` - Redirects the Small URL to the Original URL

---

`POST /v1/url` - Creates a new Small URL, or reuses an expired hash code

*BODY*

```
{
	"url": "The Original URL",
	"expirationDays": "(optional) The expiration date in days. Limited to 1-10 days"
}
```

*RESPONSE*

```
{
	"id": "{Integer} The id of small URL",
	"original_url": "The Original URL",
	"shortened_url": "The Small URL"
}
```

---

`GET /v1/url/:code` - Gets the full version of the Small URL Object

*RESPONSE*

```
{
	"id": "{Integer} The id of small URL",
	"hash": "The Small URL code",
	"url": "The Original URL",
	"creationDate": "Creation Date for this hash",
	"expirationDate": "The expiration Date for this Small URL",
	"smallUrl": "The complete Small URL (domain + hash)"
}
```

---

`GET /v1/url/:code/lite` - Gets the lite version of the Small URL Object

*RESPONSE*

```
{
	"id": "{Integer} The id of small URL",
	"original_url": "The Original URL",
	"shortened_url": "The Small URL"
}
```