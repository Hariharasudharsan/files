# API Setup & Credentials Guide

This guide provides step-by-step instructions on how to generate and obtain API keys and credentials for all external services required by the e-commerce system.

---

## 1. ERPNext / Frappe Cloud API Credentials

To allow the website to sync orders, products, and inventory with ERPNext, you need an **API Key** and **API Secret**.

### Step-by-Step Instructions:

1. **Log in to your ERPNext Desk** (e.g., `https://your-site.frappe.cloud`).
2. Navigate to **Users** (Search for "User List" in the search bar).
3. (Recommended) Create a dedicated integration user (e.g., `website-api@yourdomain.com`) with roles: `Sales Manager`, `Stock Manager`, `System Manager`.
4. Open the User profile page.
5. Scroll down to the **API Access** section.
6. Click **Generate Keys**.
7. A dialog will show your **API Secret**. 
   > **Note**: Copy and save the **API Secret** immediately! It will **never** be shown again.
8. Copy the **API Key** shown under the section.

### Environment Variables Needed:
```env
ERPNEXT_URL="https://your-site.frappe.cloud"
ERPNEXT_API_KEY="your_api_key_here"
ERPNEXT_API_SECRET="your_api_secret_here"
```

---

## 2. Razorpay API Keys & Webhooks

Razorpay requires **Test/Live API Keys** for creating payments and a **Webhook Secret** for payment verification.

### Obtaining API Key ID & Secret:
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Switch to **Test Mode** (toggle on the top right) for development.
3. In the left navigation bar, go to **Account & Settings** -> **API Keys** (under Website and app settings).
4. Click **Generate Test Key** (or Regenerate Key).
5. Copy the **Key ID** and **Key Secret**.

### Setting Up Webhook Secret:
1. In the Razorpay Dashboard, go to **Account & Settings** -> **Webhooks**.
2. Click **Add New Webhook**.
3. Set **Webhook URL** to your server endpoint (e.g., `https://your-domain.com/api/webhooks/razorpay` or ngrok URL for local testing).
4. Create a custom **Secret** string (e.g., `my_super_secret_webhook_key_123`).
5. Select the following **Active Events**:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
6. Click **Save Webhook**.

### Environment Variables Needed:
```env
RAZORPAY_KEY_ID="rzp_test_xxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="my_super_secret_webhook_key_123"
```

---

## 3. Shiprocket Shipping Credentials

Shiprocket uses your account credentials or an API user to generate authentication tokens.

### Step-by-Step Instructions:
1. Log in to your [Shiprocket Panel](https://app.shiprocket.in/).
2. Go to **Settings** -> **API** -> **Configure**.
3. Click **Create API User** (or use your primary account email and password).
4. Enter an email and password for the API user and grant full access permissions.

### Environment Variables Needed:
```env
SHIPROCKET_EMAIL="api-user@yourdomain.com"
SHIPROCKET_PASSWORD="your_api_password"
```

---

## 4. Cloudflare R2 Media Storage

Cloudflare R2 provides S3-compatible object storage for high-performance product image hosting.

### Step-by-Step Instructions:
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left sidebar, click **R2**.
3. Under **Account Details** on the right side, copy your **Account ID**.
4. Click **Manage R2 API Tokens** on the right.
5. Click **Create API Token**.
6. Set permissions to **Admin Read & Write**.
7. Click **Create API Token**.
8. Copy the **Access Key ID** and **Secret Access Key**.
9. Go back to R2 and click **Create Bucket** (e.g., named `product-images`).

### Environment Variables Needed:
```env
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="product-images"
```

---

## Summary `.env.local` Template

You can copy and paste this template directly into a `.env.local` file in the root of your project:

```env
# Database & Redis
DATABASE_URL="postgresql://postgres:password@localhost:5432/mathuram_db"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"

# ERPNext
ERPNEXT_URL="https://your-site.frappe.cloud"
ERPNEXT_API_KEY="your_api_key"
ERPNEXT_API_SECRET="your_api_secret"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Shiprocket
SHIPROCKET_EMAIL="your_email@domain.com"
SHIPROCKET_PASSWORD="your_password"

# Cloudflare R2
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="product-images"
```
