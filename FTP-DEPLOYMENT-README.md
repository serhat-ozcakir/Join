# FTP Deployment Instructions - Join Project

## Build Completed Successfully! ✓

**Build Date:** February 20, 2026  
**Routing Strategy:** Hash Location (works without .htaccess)

Your Angular application has been built for production with **Hash Location Strategy** and is ready for FTP deployment.

### 🆕 Latest Updates Included:
- ✅ **Hash Location Strategy enabled** - URLs use `#` (works on ANY server, no .htaccess needed!)
- ✅ Contact detail view updates in real-time after editing
- ✅ Strict email validation (max 30 chars, domain extension 2-4 chars)
- ✅ Name field limited to 30 characters
- ✅ Phone field limited to 20 characters
- ✅ Improved form validation with maxLength constraints
- ✅ Flexbox order-based layout for contact header (no rotation transforms)

### 🔗 URL Format with Hash Location:

Your URLs will look like:
- Home: `http://join-4-1226.developerakademie.net/#/`
- Login: `http://join-4-1226.developerakademie.net/#/login`
- Signup: `http://join-4-1226.developerakademie.net/#/signup`
- Contacts: `http://join-4-1226.developerakademie.net/#/contacts`

**Why Hash?** The `#` makes routing work without server configuration. Perfect for servers that don't support `.htaccess` or URL rewriting!

### 📁 Files Location

All deployment files are located in:
```
dist/join-project/browser/
```

### 📤 FTP Upload Instructions

1. **Connect to your FTP server** using your preferred FTP client (FileZilla, WinSCP, etc.)

2. **Upload ALL files from the `browser` folder** to your web server's public directory:
   - Usually named: `public_html`, `www`, `htdocs`, or `web`
   - Upload these files:
     - `index.html` (1.20 KB)
     - `main-MJFALNW4.js` (506.05 KB) - main application bundle
     - `styles-23FONKIN.css` (0.65 KB)
     - `favicon.ico` (14.73 KB)
     - `.htaccess` (1.62 KB) - **Optional with hash routing, but good to have**
     - `assets/` folder (entire folder with all contents)
     - `media/` folder (entire folder with all contents)

3. **Verify `.htaccess` was uploaded**
   - This file is hidden by default
   - Make sure your FTP client is set to show hidden files
   - The .htaccess file ensures Angular routing works correctly

### ⚙️ Important Notes

- **Apache Web Server**: The included `.htaccess` file is for Apache servers. If your server uses Nginx, you'll need a different configuration.

- **Base Href**: If your app is NOT in the root directory (e.g., `example.com/subfolder/`), rebuild with:
  ```bash
  ng build --base-href /subfolder/
  ```

- **HTTPS**: Uncomment the HTTPS redirect in `.htaccess` if you have an SSL certificate installed

### 🔒 Supabase Configuration

Make sure your Supabase project settings allow requests from your domain:
1. Go to Supabase Dashboard → Settings → API
2. Add your domain to the allowed URLs
3. Update CORS settings if needed

### ⚠️ Build Warnings (Non-Critical)

The following warnings were generated but won't affect functionality:
- Initial bundle: 506.71 kB (6.71 kB over budget)
- contact-detail.scss: 5.40 kB (1.40 kB over budget)
- contact-form-dialog.scss: 5.87 kB (1.87 kB over budget)

These are size warnings. The app will work perfectly, but you may want to optimize these files if performance becomes critical.

### 🧪 Testing After Deployment

1. Visit your domain (e.g., `http://join-4-1226.developerakademie.net/`)
2. Test all routes (note the # in URLs):
   - `/#/login` - User login page
   - `/#/signup` - New user registration
   - `/#/summary` - Dashboard summary
   - `/#/board` - Kanban board view
   - `/#/contacts` - Contact management
   - `/#/help` - Help documentation
3. **Refresh works!** With hash routing, refresh on any page will work perfectly
4. Test contact operations:
   - Create new contact with validation (name max 30 chars, email max 30 chars, phone max 20 chars)
   - Edit contact and verify detail view updates automatically
   - Delete contact
   - Test email validation (must be valid format with 2-4 char domain extension)
5. Test guest login functionality
6. Test responsive behavior (contact list, animations, FAB menu)

### 📊 File Structure on Server

Your server's public directory should look like:
```
public_html/
├── index.html
├── main-MJFALNW4.js
├── styles-23FONKIN.css
├── favicon.ico
├── .htaccess (optional with hash routing)
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── img/
└── media/
```

### 🔄 For Future Updates

When you need to update the app:
1. Run `npm run build` again
2. Upload the new files from `dist/join-project/browser/`
3. Overwrite existing files on the server
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### 🆘 Troubleshooting

**Problem**: Routes show 404 on refresh
- **Solution**: This should NOT happen with hash routing! If it does, verify all files were uploaded correctly.

**Problem**: URLs don't have `#` in them
- **Solution**: Make sure you uploaded the latest build files. The new build uses hash location strategy.

**Problem**: App doesn't load
- **Solution**: Check browser console for errors, verify all files were uploaded correctly

**Problem**: Supabase connection errors
- **Solution**: Verify your domain is allowed in Supabase Dashboard → Settings → API

**Problem**: Form validation not working
- **Solution**: Clear browser cache and reload (Ctrl+Shift+R)

**Problem**: Contact detail doesn't update after editing
- **Solution**: This should be fixed in the latest build. Clear cache and try again.

**Problem**: Styles not loading correctly
- **Solution**: Make sure `styles-23FONKIN.css` was uploaded correctly

---

## ✅ Ready to Deploy!

**Total size:** ~507 KB (compressed: ~120 KB)  
**Routing:** Hash Location Strategy (no server configuration needed!)

Connect to your FTP server and upload all files from the `browser` folder to start using your Join Kanban application!

**After upload, access your app at:**
- `http://join-4-1226.developerakademie.net/` (redirects to `#/login`)
- Or directly: `http://join-4-1226.developerakademie.net/#/login`

**No more 404 errors!** The hash routing works on any server without special configuration. 🚀

**Questions?** Check the troubleshooting section above or verify that all files were uploaded correctly.
