# Reverse-proxy reference

Production and UAT use an Infrastructure-owned proxy outside the Frontend
image. `adcendy.conf.template` is the executable reference for the versioned
contract in `config/deployment/frontend-proxy-contract.v1.json`.

Render only the four declared template variables so Nginx runtime variables
remain intact:

```sh
envsubst '${PUBLIC_HOST} ${PUBLIC_SCHEME} ${BACKEND_UPSTREAM} ${FRONTEND_UPSTREAM}' \
  < adcendy.conf.template > /etc/nginx/conf.d/default.conf
```

Required deployed values:

- `PUBLIC_SCHEME=https`
- `PUBLIC_HOST=uat.adcendy.com` or `app.adcendy.com`
- `BACKEND_UPSTREAM=http://api:3001`
- `FRONTEND_UPSTREAM=http://frontend:3000`

The proxy must be reachable only through the trusted Cloudflare Tunnel
boundary. Cloudflare must supply the authoritative `CF-Connecting-IP`; the
proxy overwrites the forwarded-header set before sending a request to Backend.
The two Backend health paths are explicitly denied before the `/v1/*` rule.
