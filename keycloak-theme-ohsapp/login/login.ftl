<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OHSapp Login</title>
  <link rel="stylesheet" href="../resources/css/login.css">
  <#if properties.kcLogo?has_content>
    <link rel="icon" href="${properties.kcLogo}" type="image/png">
  </#if>
</head>
<body>
  <div id="kc-logo">
    <img src="${properties.kcLogo!'/logo.png'}" alt="OHSapp Logo">
  </div>
  <div id="kc-header">
    <div id="kc-header-wrapper">OHS APP</div>
  </div>
  <#if message?has_content>
    <div class="alert alert-error" style="color:#dc2626; text-align:center; margin-bottom:1rem;">
      ${message.summary}
    </div>
  </#if>
  <form id="kc-form-login" onsubmit="login.disabled=true; return true;" action="${url.loginAction}" method="post">
    <div class="form-group">
      <label for="username">${msg("username")}</label>
      <input tabindex="1" id="username" name="username" type="text" autofocus autocomplete="username" value="${(login.username!'')}">
    </div>
    <div class="form-group">
      <label for="password">${msg("password")}</label>
      <input tabindex="2" id="password" name="password" type="password" autocomplete="current-password">
    </div>
    <#if realm.resetPasswordAllowed>
      <div style="text-align:right; margin-bottom:1rem;">
        <a href="${url.loginResetCredentials}" style="color:#dc2626; text-decoration:underline; font-size:0.95rem;">${msg("doForgotPassword")}</a>
      </div>
    </#if>
    <div id="kc-form-buttons">
      <input tabindex="4" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}">
    </div>
    <#if realm.social>
      <div style="margin:2rem 0 1rem 0; text-align:center; color:#6b7280; font-size:0.95rem;">${msg("identity-provider-login-label")}</div>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <#list social.providers as p>
          <a class="btn" href="${p.loginUrl}" style="display:flex; align-items:center; justify-content:center; gap:0.5rem; background:#fff; color:#dc2626; border:1.5px solid #dc2626; font-weight:600;">
            <#if p.alias == 'google'>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            </#if>
            ${p.displayName}
          </a>
        </#list>
      </div>
    </#if>
  </form>
</body>
</html>
