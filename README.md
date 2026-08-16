# Artiva Studio Manager

Build a modern, simple and professional business management web app called Artiva Business.



The website is for a handmade business selling Crochet, Ceramics, and Handmade Art/Paintings.



The goal is to create one dashboard that helps me manage the entire business easily without complicated accounting knowledge.



1. Main Dashboard



Create a beautiful dashboard showing:



- Total revenue

- Total expenses

- Net profit

- Number of orders

- Pending orders

- Completed orders

- Products currently in stock

- Total material cost

- Profit this month

- Profit this year



Add simple visual charts for:



- Revenue

- Expenses

- Profit

- Orders

- Best-selling products



Allow filtering by:



- Today

- This week

- This month

- This year

- Custom date range



---



2. Orders / Commandes



Create an order management system.



Each order should contain:



- Order number

- Customer name

- Customer phone

- Product

- Category

- Quantity

- Selling price

- Material cost

- Other costs

- Total price

- Profit

- Order date

- Delivery date

- Payment status

- Order status

- Notes



Order statuses:



- New

- In production

- Ready

- Delivered

- Cancelled



Payment statuses:



- Unpaid

- Partially paid

- Fully paid



Automatically calculate:



Profit = Selling Price - Material Cost - Other Costs



---



3. Materials Management



Create a complete materials section.



For every material, store:



- Material name

- Category

- Quantity available

- Unit

- Purchase price

- Supplier

- Minimum stock level

- Date purchased

- Notes



Examples:



- Yarn

- Clay

- Paint

- Brushes

- Packaging

- Earring hooks

- Glue

- Beads

- Thread

- Other supplies



The system should automatically warn me when a material reaches its minimum stock level.



Example:



"⚠️ Low Stock: White Yarn"



---



4. Material Cost Calculator



Create a calculator that helps me know exactly how much a product costs to make.



For each product, I can add multiple materials.



Example:



Product: Crochet Bag



- 300g yarn → 12 TND

- Button → 2 TND

- Packaging → 1.5 TND

- Other costs → 1 TND



The system automatically calculates:



Total production cost = 16.5 TND



Then I enter the selling price.



Example:



Selling price = 45 TND



Automatically show:



- Production cost: 16.5 TND

- Selling price: 45 TND

- Profit: 28.5 TND

- Profit margin: 63.3%



---



5. Product Management



Create a products section.



Each product should have:



- Product name

- Category

- Product photo

- Description

- Materials used

- Production cost

- Selling price

- Profit

- Stock quantity

- Estimated production time

- Product status



Categories:



Crochet



Use a turquoise / dark green visual identity.



Ceramics



Use soft pastel colors.



Painting



Use artistic pastel colors.



Do not change the Artiva brand identity. Keep the interface elegant, handmade, modern and premium.



---



6. Money Management



Create a simple financial management section.



Divide money into:



Revenue



Money received from customers.



Material Budget



Money reserved to buy materials.



Business Expenses



Examples:



- Packaging

- Delivery

- Tools

- Advertising

- Electricity

- Transportation

- Other expenses



Profit



Automatically calculate:



Net Profit = Revenue - Material Costs - Business Expenses



---



7. Smart Profit Distribution



Create a feature called:



"Profit Distribution"



After calculating the net profit, automatically suggest a distribution.



Example:



If profit = 100 TND:



- 40% → Reinvestment / Materials

- 30% → Personal income

- 20% → Business savings

- 10% → Emergency fund



Allow me to change these percentages.



The system must verify that the total percentages equal 100%.



Show the distribution visually with a pie chart.



---



8. Product Pricing Assistant



Create a smart pricing calculator.



I enter:



- Material cost

- Production time

- Hourly value of my work

- Packaging cost

- Delivery cost

- Desired profit margin



The system suggests a selling price.



Example:



Material cost = 15 TND

Labor = 10 TND

Packaging = 2 TND

Other costs = 3 TND



Production cost = 30 TND



Desired profit margin = 40%



Suggested selling price = automatically calculated.



Show:



- Minimum price

- Recommended price

- Premium price



---



9. Inventory



Create a simple inventory system.



Track:



- Products

- Materials

- Quantity

- Stock value

- Low-stock alerts

- Recently purchased materials

- Materials used in orders



When I create an order, automatically reduce the corresponding material quantities.



When I purchase materials, automatically increase the stock.



---



10. Customer Management



Create a Customers section.



For every customer:



- Name

- Phone

- Instagram username

- Number of orders

- Total spent

- Last order

- Favorite products

- Notes



Show customer history.



---



11. Suppliers



Create a Suppliers section.



Store:



- Supplier name

- Phone

- Instagram/Facebook

- Materials supplied

- Prices

- Notes



---



12. Business Analytics



Create an analytics page showing:



- Best-selling product

- Most profitable product

- Least profitable product

- Most expensive material

- Monthly revenue

- Monthly expenses

- Monthly profit

- Average order value

- Profit margin

- Number of customers

- Repeat customers



Also show comparisons between months.



Example:



August vs July



Revenue: +18%

Profit: +25%

Orders: +12%



---



13. Production Planner



Add a simple production planner.



I should be able to create:



- Product

- Quantity

- Deadline

- Priority

- Customer

- Status



Priority:



- Low

- Medium

- High

- Urgent



Display upcoming production tasks clearly.



---



14. Daily Business Tasks



Create a small "Today's Tasks" section.



Examples:



- Prepare order #025

- Buy white clay

- Package 3 orders

- Photograph new products

- Post Instagram Reel

- Update inventory

- Contact customer



Allow me to mark tasks as completed.



---



15. Dashboard Quick Actions



At the top of the dashboard add buttons:



+ New Order



+ New Product



+ Add Material



+ Expense



+ Customer



+ Production Task



These should open simple forms.



---



16. Notifications



Create smart notifications.



Examples:



⚠️ Material stock is low.



💰 You made 85 TND profit today.



📦 Order #025 delivery is tomorrow.



📉 Product "Blue Bag" has a very low profit margin.



🔥 "Ceramic Spider Plate" is your best-selling product.



---



17. Business Goals



Add a "Goals" section.



Allow me to set:



- Monthly revenue goal

- Monthly profit goal

- Number of orders goal

- Number of products goal



Show progress bars.



Example:



Monthly profit goal: 500 TND



Progress: 320 / 500 TND



---



18. Expenses



Create an expense tracker.



Every expense should have:



- Name

- Amount

- Category

- Date

- Description



Categories:



- Materials

- Packaging

- Delivery

- Advertising

- Tools

- Transportation

- Other



Automatically include expenses in profit calculations.



---



19. Reports



Create automatic reports:



- Daily report

- Weekly report

- Monthly report

- Yearly report



Each report should show:



Revenue

Expenses

Material costs

Profit

Orders

Best-selling products

Most profitable products



Allow exporting reports as PDF or CSV.



---



20. Design



The interface must be:



- Modern

- Elegant

- Minimal

- Very easy to use

- Mobile-first

- Responsive

- Fast

- Professional



Brand name:



ARTIVA BUSINESS



Use a clean Artiva-inspired visual identity.



Use soft pastel colors while keeping the interface professional.



Use cards, clean charts, rounded corners and subtle animations.



Do NOT make the dashboard complicated.



Everything should be understandable at a glance.



---



21. Important Business Logic



All calculations must be automatic.



For every order:



Revenue → automatically recorded.



Material cost → automatically calculated.



Expenses → automatically recorded.



Profit → automatically calculated.



Inventory → automatically updated.



Customer history → automatically updated.



Analytics → automatically updated.



Do not require me to calculate things manually.



---



22. Data Persistence



The application must save all information permanently.



Use a real database such as Supabase or Firebase.



I must be able to close the website and come back later without losing:



- Orders

- Products

- Materials

- Customers

- Expenses

- Suppliers

- Profits

- Inventory

- Tasks

- Reports



Add authentication with a secure admin login.



---



23. Extra Smart Features



Add useful features that can make Artiva Business easier to manage:



- Automatic profit calculations

- Automatic low-stock alerts

- Automatic monthly summaries

- Best-product detection

- Profit-margin warnings

- Smart pricing suggestions

- Order deadline reminders

- Inventory value calculation

- Customer spending statistics

- Business growth percentage

- Reinvestment recommendations



The system should feel like a small personal business manager/accountant for Artiva, not just a basic order list.



Make the UI extremely simple so I can manage my handmade business from my phone.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://artiva-craft-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43a54f2b-bff6-4519-936f-a62c3514f60b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
