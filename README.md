# 🛒 ScanPay

**ScanPay** is a mobile self-checkout app built with React Native and Expo. Shoppers scan product barcodes with their phone camera, build a cart, pay online through Razorpay, and get a QR receipt. Store staff scan that receipt at the exit to verify the purchase.

## ✨ Features

### For customers
- **Phone OTP login**: sign in with a mobile number (+91) using Firebase Authentication
- **Barcode scanning**: supports QR, EAN-13, EAN-8, Code 128, Code 39, UPC-A and UPC-E, with torch and zoom controls
- **Smart cart**: add items, change quantities, and see the live cart badge on the tab bar
- **Quick re-add**: recent scan history for fast re-adding of products
- **Manual product entry**: if a barcode isn't in the database, enter the name, price and category, and it's saved and added to the cart
- **Browse and search**: product catalogue with search and category sections (Food, Snacks, Dairy, Beauty), plus a product detail page
- **Razorpay payments**: checkout runs in a WebView, with 5% tax calculated automatically
- **QR receipt**: a unique receipt QR is generated for each paid order
- **Order history**: view past orders
- **Profile management**: edit your profile
- **Light and dark themes**

### For staff and admins
- **Security verification**: scan a customer's QR receipt to confirm the order. Each receipt can only be verified once, so reused QRs are flagged as "Already Verified".
- **Admin panel**: add, edit and delete products, and view all orders

## 🧰 Tech stack

| Area | Technology |
|---|---|
| Framework | React Native 0.81, React 19, Expo SDK 54 |
| Navigation | React Navigation 7 (bottom tabs and native stack) |
| Auth | Firebase Authentication (phone / OTP) |
| Database | Cloud Firestore |
| Payments | Razorpay Checkout (via `react-native-webview`) |
| Camera and scanning | `expo-camera` |
| QR generation | `react-native-qrcode-svg` |
| State | React Context (Cart, Theme) |
| Builds | EAS Build |

## 📁 Project structure

```
ScanPayApp/
├── App.js                 # Root navigation and auth gate
├── index.js               # App entry point
├── firebase.js            # Firebase initialisation (reads from app.config.js)
├── app.config.js          # Expo config and environment variables
├── eas.json               # EAS build profiles
├── components/
│   ├── ProductImage.js
│   └── Toast.js
├── constants/
│   └── Colors.js          # Light and dark theme palettes
├── context/
│   ├── CartContext.js     # Cart state
│   └── ThemeContext.js    # Theme state
├── screens/
│   ├── SplashScreen.js
│   ├── LoginScreen.js / OTPScreen.js
│   ├── HomeScreen.js / ProductDetailScreen.js
│   ├── ScanScreen.js
│   ├── PaymentScreen.js / RazorpayScreen.js
│   ├── QRReceiptScreen.js / OrderHistoryScreen.js
│   ├── ProfileScreen.js / EditProfileScreen.js
│   ├── VerifyScreen.js    # Staff receipt verification
│   └── AdminScreen.js     # Product and order management
└── assets/                # Icons and splash images
```

## 🚀 Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- npm
- A [Firebase](https://console.firebase.google.com/) project
- A [Razorpay](https://razorpay.com/) account (test mode is fine)
- The **Expo Go** app, or an Android/iOS emulator

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ScanPayApp
npm install
```

### 2. Set up Firebase

1. Create a Firebase project and add a web app to get your config values.
2. Enable **Authentication → Sign-in method → Phone**.
3. For development, add **test phone numbers** under the Phone provider so you can log in without sending real SMS.
4. Create a **Cloud Firestore** database.

### 3. Configure environment variables

Create a `.env` file in the project root (it's already git-ignored):

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

These are loaded in `app.config.js` and read at runtime through `expo-constants`.

> Only use your Razorpay **Key ID** in the app. Never put the Key Secret in client code.

### 4. Run the app

```bash
npm start          # Start the Expo dev server
npm run android    # Open on Android
npm run ios        # Open on iOS
npm run web        # Open in the browser
```

Scan the QR code from the terminal with Expo Go. Camera-based features work best on a physical device.

## 🗄️ Firestore data model

The app uses three collections.

**`products`**
```
name, price, barcode, category, description, stock, discount
```

**`orders`**
```
orderId, userId, phone, items[], subtotal, tax, total,
status ("paid"), paymentId, createdAt, verified
```

**`users`** (document ID = Firebase `uid`)
```
name, phone, ...profile fields
```

To get started, add a few documents to `products` (via the Admin Panel or the Firebase console) with real barcode values you can scan.

## 🔄 How it works

1. **Login**: enter a phone number, receive an OTP, and verify it.
2. **Scan**: point the camera at a barcode. The app looks up `products` by `barcode` and adds a match to the cart.
3. **Pay**: review the cart (subtotal plus 5% tax), then pay with Razorpay. The order is saved to Firestore and marked paid on success.
4. **Receipt**: a QR code containing the order ID is shown.
5. **Verify**: staff open the Verify screen, scan the receipt, and the order is marked `verified: true`.

## 📦 Building

Build profiles are defined in `eas.json`:

```bash
npm install -g eas-cli
eas login

eas build --profile preview --platform android      # APK for testing
eas build --profile production --platform android   # App bundle for the Play Store
```

Set your environment variables as EAS secrets or in the build profile so the Firebase and Razorpay values are available in cloud builds.

## 🔐 Admin access

The Admin Panel and Security Verify tools are exposed to a designated admin account, which the app currently identifies by a hard-coded phone number in `screens/ProfileScreen.js`. Change it to your own number before deploying.

## ⚠️ Known limitations and next steps

Before using this in production, consider:

- **Server-side payment verification**: payments are currently confirmed on the client. Create Razorpay orders and verify payment signatures on a backend (e.g. Firebase Cloud Functions).
- **Admin check**: replace the hard-coded phone number with Firebase custom claims or a role field, and enforce it in **Firestore security rules**.
- **Firestore security rules**: lock down `products`, `orders` and `users` so clients can only access what they should.
- **Stock management**: stock is stored but not decremented after purchase.
- **Dependencies**: `expo-barcode-scanner` and `expo-firebase-recaptcha` are listed in `package.json` but are deprecated. The app uses `expo-camera` for scanning, so they can likely be removed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

Add your preferred license here (e.g. MIT).
