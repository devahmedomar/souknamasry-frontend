# Git Commands to Delete API Folder and Deploy

## Delete the API folder (not needed)
```bash
git rm -r api
```

## Commit all changes
```bash
git add .
git commit -m "Fix social media sharing - remove unnecessary api folder"
git push origin master
```

After deployment, use Facebook Sharing Debugger to clear cache!
