# auth.md

Troolify (`https://f9xr.org/troolify/`), by the F9XR Team, publishes static,
public content: a hub of free browser-based tools. There is no authenticated
API, no OAuth authorization server, and no token endpoint.

## Agent audience

This document is for AI agents and automated clients that want to use, consume
or cite Troolify's public information and tools. Every resource is open and
unauthenticated.

## Authentication

- **Required**: none.
- **Anonymous access**: supported for every published resource.
- All pages and data files at `https://f9xr.org/troolify/` are readable without
  credentials, registration, or API keys.

## Registration / provisioning

There is no programmatic agent-registration endpoint. If you need a credentialed
integration (for example, a bespoke data feed or access to client project
systems), request it by email and a human will provision it.

- **Registration / provisioning**: mailto:hello@f9xr.org
- **Supported method**: manual, human-verified provisioning only.
- **Credential types**: none are issued through this site.

## OAuth / OIDC

Troolify does not operate an OAuth 2.0 authorization server or an OpenID Connect
provider. There is no `/.well-known/oauth-authorization-server` or
`/.well-known/openid-configuration`, and the
`/.well-known/oauth-protected-resource` document lists no authorization servers,
because there are no protected resources.

## Credential use

No credentials are needed. If you ever receive credentials from F9XR out of
band, use them only for the specific resource they were issued for and never
send them to `f9xr.org`, which does not accept or store them.

## Machine-readable resources

- LLM summary: https://f9xr.org/troolify/llms.txt
- AI agent information: https://f9xr.org/troolify/ai.txt
- API catalog (linkset): https://f9xr.org/troolify/.well-known/api-catalog
- OAuth Protected Resource Metadata: https://f9xr.org/troolify/.well-known/oauth-protected-resource
- Sitemap: https://f9xr.org/troolify/sitemap.xml
- Contact: hello@f9xr.org
