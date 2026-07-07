"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Bell, Search, LogOut, ChevronDown, Plus, X, Globe, ClipboardList, Coins, AlertTriangle, ShieldCheck, FileText, ShoppingCart, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminTopbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  // Spotlight Search Index State
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [scripts, setScripts] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Global Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Refs for outside click dismissals
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSafely = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(`Failed to fetch ${url}`, e);
      return [];
    }
  };

  // Load Search Indexes
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [prodsRes, pagesRes, blogsRes, catsRes, custsRes, ordersRes, discRes, affRes, promoRes, revsRes, scriptsRes] = await Promise.all([
          fetchSafely("/api/admin/products"),
          fetchSafely("/api/admin/pages"),
          fetchSafely("/api/admin/blogs"),
          fetchSafely("/api/admin/categories"),
          fetchSafely("/api/admin/customers"),
          fetchSafely("/api/admin/orders"),
          fetchSafely("/api/admin/discounts"),
          fetchSafely("/api/admin/affiliates/list"),
          fetchSafely("/api/admin/promotions"),
          fetchSafely("/api/admin/reviews"),
          fetchSafely("/api/admin/scripts")
        ]);

        if (Array.isArray(prodsRes)) setProducts(prodsRes);
        else if (prodsRes?.success && Array.isArray(prodsRes.products)) setProducts(prodsRes.products);
        
        if (Array.isArray(pagesRes)) setPages(pagesRes);
        else if (pagesRes?.success && Array.isArray(pagesRes.pages)) setPages(pagesRes.pages);
        
        if (Array.isArray(blogsRes)) setBlogs(blogsRes);
        else if (blogsRes?.success && Array.isArray(blogsRes.blogs)) setBlogs(blogsRes.blogs);

        if (Array.isArray(catsRes)) setCategories(catsRes);
        else if (catsRes?.success && Array.isArray(catsRes.categories)) setCategories(catsRes.categories);

        if (Array.isArray(custsRes)) setCustomers(custsRes);
        else if (custsRes?.success && Array.isArray(custsRes.customers)) setCustomers(custsRes.customers);

        if (Array.isArray(ordersRes)) setOrders(ordersRes);
        else if (ordersRes?.success && Array.isArray(ordersRes.orders)) setOrders(ordersRes.orders);

        if (Array.isArray(discRes)) setDiscounts(discRes);
        else if (discRes?.success && Array.isArray(discRes.discounts)) setDiscounts(discRes.discounts);
        else if (discRes?.success && Array.isArray(discRes.coupons)) setDiscounts(discRes.coupons);

        if (Array.isArray(affRes)) setAffiliates(affRes);
        else if (affRes?.success && Array.isArray(affRes.affiliates)) setAffiliates(affRes.affiliates);

        if (Array.isArray(promoRes)) setPromotions(promoRes);
        else if (promoRes?.success && Array.isArray(promoRes.promotions)) setPromotions(promoRes.promotions);

        if (Array.isArray(revsRes)) setReviews(revsRes);
        else if (revsRes?.success && Array.isArray(revsRes.reviews)) setReviews(revsRes.reviews);

        if (Array.isArray(scriptsRes)) setScripts(scriptsRes);
        else if (scriptsRes?.success && Array.isArray(scriptsRes.scripts)) setScripts(scriptsRes.scripts);
      } catch (err) {
        console.error("Failed to load search indexes", err);
      }
    };
    fetchSearchData();
  }, []);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const [ordersRes, affiliatesRes, productsRes] = await Promise.all([
        fetch("/api/admin/orders?status=Pending").then(r => r.json().catch(() => ({}))),
        fetch("/api/admin/affiliates/requests").then(r => r.json().catch(() => ({}))),
        fetch("/api/admin/products").then(r => r.json().catch(() => ([])))
      ]);

      let orderNotices = [];
      let affiliateNotices = [];
      let productNotices = [];

      if (ordersRes?.success && Array.isArray(ordersRes.orders)) {
        orderNotices = ordersRes.orders.map(order => ({
          id: `order-${order._id}`,
          type: "order",
          targetId: order._id,
          text: `New order request #${order.orderNumber} received from ${order.shippingAddress?.fullName || order.customer?.email || "Guest"}. (Total: $${order.financials?.total || 0})`,
          actions: [
            { label: "Confirm Order", action: () => handleOrderAction(order._id, "Confirmed") },
            { label: "View Details", href: `/admin/orders/${order._id}` }
          ]
        }));
      }

      if (affiliatesRes?.success && Array.isArray(affiliatesRes.applications)) {
        affiliateNotices = affiliatesRes.applications.filter(app => app.status === "Pending").map(app => ({
          id: `affiliate-${app._id}`,
          type: "affiliate",
          targetId: app._id,
          text: `New affiliate request from ${app.name} (${app.email}) is pending review.`,
          actions: [
            { label: "Approve", action: () => handleAffiliateAction(app._id, "Approve") },
            { label: "Reject", action: () => handleAffiliateAction(app._id, "Reject") }
          ]
        }));
      }

      const prodList = Array.isArray(productsRes) ? productsRes : [];
      productNotices = prodList.filter(p => p.manageStock && p.stock <= (p.lowStockThreshold || 5)).map(p => ({
        id: `product-${p._id}`,
        type: "product",
        targetId: p._id,
        text: `Product '${p.name}' is running low in stock (${p.stock} units remaining).`,
        actions: [
          { label: "Restock / Edit", href: `/admin/products/${p._id}` }
        ]
      }));

      setNotifications([...orderNotices, ...affiliateNotices, ...productNotices]);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderAction = async (id, status) => {
    setUpdatingId(`order-${id}`);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Order status updated to ${status}!`);
        await fetchNotifications();
      } else {
        toast.error("Failed to update order.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAffiliateAction = async (applicationId, action) => {
    setUpdatingId(`affiliate-${applicationId}`);
    try {
      const res = await fetch("/api/admin/affiliates/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action })
      });
      if (res.ok) {
        toast.success(`Affiliate application ${action === 'Approve' ? 'approved' : 'rejected'} successfully!`);
        await fetchNotifications();
      } else {
        const data = await res.json();
        toast.error(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Advanced Search & Action Dispatch Filter
  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return [
        { category: "Common Tasks", title: "Add New Product", href: "/admin/products/new", desc: "Create a new inventory item" },
        { category: "Common Tasks", title: "Add New Blog Post", href: "/admin/blogs/new", desc: "Write a new article" },
        { category: "Common Tasks", title: "Homepage SEO & Content", href: "/admin/pages", desc: "Configure home page layout and SEO" },
        { category: "Common Tasks", title: "Affiliate Overviews", href: "/admin/affiliates?view=overview", desc: "Check partner program statistics" },
        { category: "Common Tasks", title: "Affiliate Applications", href: "/admin/affiliates?view=requests", desc: "Review pending partner signups" },
        { category: "Common Tasks", title: "Payout Requests", href: "/admin/affiliates?view=payouts", desc: "Approve or deny partner withdrawals" }
      ];
    }

    const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    // Commands mapping
    const isEdit = queryWords.includes("edit") || queryWords.includes("modify") || queryWords.includes("change") || queryWords.includes("update");
    const isPrice = queryWords.includes("price") || queryWords.includes("pricing") || queryWords.includes("sale") || queryWords.includes("cost") || queryWords.includes("regular");
    const isSeo = queryWords.includes("seo") || queryWords.includes("meta") || queryWords.includes("search") || queryWords.includes("google");
    const isStock = queryWords.includes("stock") || queryWords.includes("inventory") || queryWords.includes("quantity") || queryWords.includes("qty") || queryWords.includes("manage");
    const isVariants = queryWords.includes("variant") || queryWords.includes("variants") || queryWords.includes("color") || queryWords.includes("colors") || queryWords.includes("size") || queryWords.includes("sizes");
    const isFaqs = queryWords.includes("faq") || queryWords.includes("faqs") || queryWords.includes("question") || queryWords.includes("questions") || queryWords.includes("answer");
    const isStats = queryWords.includes("stat") || queryWords.includes("stats") || queryWords.includes("statistics") || queryWords.includes("analytics");

    const commandWords = [
      "edit", "modify", "change", "update",
      "price", "pricing", "sale", "cost", "regular",
      "seo", "meta", "search", "google",
      "stock", "inventory", "quantity", "qty", "manage",
      "variant", "variants", "color", "colors", "size", "sizes",
      "faq", "faqs", "question", "questions", "answer",
      "stat", "stats", "statistics", "analytics",
      "add", "new", "create", "delete", "remove"
    ];

    const searchWords = queryWords.filter(w => !commandWords.includes(w));
    const results = [];

    if (searchWords.length > 0) {
      // 1. Products matches
      products.forEach(p => {
        const nameLower = p.name.toLowerCase();
        const skuLower = (p.sku || "").toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w) || skuLower.includes(w));
        
        if (matchesAll) {
          const hasCommand = isPrice || isStock || isVariants || isSeo || isFaqs || isStats;
          
          if (!hasCommand || isEdit) {
            results.push({
              category: "Products",
              title: `Edit Details: "${p.name}"`,
              href: `/admin/products/${p._id}`,
              desc: `Update description, image settings and categories`
            });
          }
          if (isPrice || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit Price: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=pricing`,
              desc: `Update Regular price & Sale price`
            });
          }
          if (isStock || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit Stock: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=stock`,
              desc: `Manage stock inventory size and tracking settings`
            });
          }
          if (isVariants || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit Variants: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=variants`,
              desc: `Configure color swatches, size configurations and variable engines`
            });
          }
          if (isSeo || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit SEO: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=seo`,
              desc: `Set page focus keywords and description`
            });
          }
          if (isFaqs || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit FAQs: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=faqs`,
              desc: `Manage product FAQs`
            });
          }
          if (isStats || !hasCommand) {
            results.push({
              category: "Products",
              title: `Edit Badges: "${p.name}"`,
              href: `/admin/products/${p._id}?focus=stats`,
              desc: `Manage custom highlight bullets`
            });
          }
        }
      });

      // 2. Pages matches
      pages.forEach(pg => {
        const titleLower = pg.title.toLowerCase();
        const matchesAll = searchWords.every(w => titleLower.includes(w));
        
        if (matchesAll) {
          const hasCommand = isSeo;
          if (!hasCommand) {
            results.push({
              category: "Pages",
              title: `Edit Sections: "${pg.title}"`,
              href: `/admin/pages/${pg._id}?tab=content`,
              desc: `Configure templates and layout elements`
            });
          }
          if (isSeo || !hasCommand) {
            results.push({
              category: "Pages",
              title: `Edit SEO: "${pg.title}"`,
              href: `/admin/pages/${pg._id}?tab=seo`,
              desc: `Manage search engine tags and custom snippets`
            });
          }
        }
      });

      // Specific custom match for "home seo"
      const homeMatches = searchQuery.toLowerCase().includes("home") && searchQuery.toLowerCase().includes("seo");
      if (homeMatches) {
        const homePage = pages.find(p => p.slug === "home" || p.slug === "" || p.title.toLowerCase() === "home");
        if (homePage) {
          results.unshift({
            category: "Shortcut",
            title: `Configure Homepage SEO`,
            href: `/admin/pages/${homePage._id}?tab=seo`,
            desc: `Direct navigation to home page SEO suite`
          });
        }
      }

      // 3. Blogs matches
      blogs.forEach(b => {
        const titleLower = b.title.toLowerCase();
        const matchesAll = searchWords.every(w => titleLower.includes(w));
        
        if (matchesAll) {
          const hasCommand = isSeo;
          if (!hasCommand) {
            results.push({
              category: "Blogs",
              title: `Edit Post: "${b.title}"`,
              href: `/admin/blogs/${b._id}?tab=content`,
              desc: `Update article body text, visual sections, and categories`
            });
          }
          if (isSeo || !hasCommand) {
            results.push({
              category: "Blogs",
              title: `Edit Blog SEO: "${b.title}"`,
              href: `/admin/blogs/${b._id}?tab=seo`,
              desc: `Update keywords and meta info for this article`
            });
          }
        }
      });

      // 4. Categories matches
      categories.forEach(cat => {
        const nameLower = cat.name.toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Categories",
            title: `Edit Category: "${cat.name}"`,
            href: `/admin/products/categories/${cat._id}`,
            desc: `Configure subcategories and banner tags`
          });
        }
      });

      // 5. Customers matches
      customers.forEach(cust => {
        const nameLower = (cust.name || "").toLowerCase();
        const emailLower = (cust.email || "").toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w) || emailLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Customers",
            title: `Edit Customer: "${cust.name || cust.email}"`,
            href: `/admin/customers/${cust._id}`,
            desc: `Inspect and edit customer records`
          });
        }
      });

      // 6. Orders matches
      orders.forEach(order => {
        const orderNumStr = String(order.orderNumber);
        const custNameLower = (order.shippingAddress?.fullName || "").toLowerCase();
        const custEmailLower = (order.customer?.email || "").toLowerCase();
        const matchesAll = searchWords.every(w => orderNumStr.includes(w) || custNameLower.includes(w) || custEmailLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Orders",
            title: `Edit Order: #${order.orderNumber} (${order.shippingAddress?.fullName || "Guest"})`,
            href: `/admin/orders/${order._id}`,
            desc: `Confirm, fulfill, or edit items`
          });
        }
      });

      // 7. Coupons matches
      discounts.forEach(d => {
        const codeLower = (d.code || "").toLowerCase();
        const matchesAll = searchWords.every(w => codeLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Coupons",
            title: `Manage Coupon: "${d.code}"`,
            href: `/admin/discounts?search=${d.code}`,
            desc: `Edit limitations, value or expiration`
          });
        }
      });

      // 8. Affiliates matches
      affiliates.forEach(aff => {
        const nameLower = (aff.name || "").toLowerCase();
        const emailLower = (aff.email || "").toLowerCase();
        const codeLower = (aff.code || "").toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w) || emailLower.includes(w) || codeLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Affiliates",
            title: `Edit Partner: "${aff.name} (${aff.code})"`,
            href: `/admin/affiliates?view=list&search=${aff.code || aff.email}`,
            desc: `Update commission shares and review performance`
          });
        }
      });

      // 9. Promotions matches
      promotions.forEach(promo => {
        const nameLower = (promo.name || "").toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Promotions",
            title: `Edit Promotion: "${promo.name}"`,
            href: `/admin/promotions/${promo._id}`,
            desc: `Configure dynamic cart/checkout deals`
          });
        }
      });

      // 10. Reviews matches
      reviews.forEach(rev => {
        const authorLower = (rev.author || "").toLowerCase();
        const contentLower = (rev.content || "").toLowerCase();
        const matchesAll = searchWords.every(w => authorLower.includes(w) || contentLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Reviews",
            title: `Manage Review by "${rev.author}"`,
            href: `/admin/reviews?search=${rev.author}`,
            desc: `Approve, reply, delete or shadow-ban review`
          });
        }
      });

      // 11. Custom Scripts matches
      scripts.forEach(sc => {
        const nameLower = (sc.name || "").toLowerCase();
        const matchesAll = searchWords.every(w => nameLower.includes(w));
        
        if (matchesAll) {
          results.push({
            category: "Scripts",
            title: `Edit Script: "${sc.name}"`,
            href: `/admin/settings/scripts/${sc._id}`,
            desc: `Edit injected pixel/code`
          });
        }
      });
    }

    // Navigational query words overrides
    const qStr = searchQuery.toLowerCase();
    if (qStr.includes("product") || qStr.includes("add")) {
      results.push({ category: "Navigation", title: "Add New Product", href: "/admin/products/new", desc: "Create new inventory item" });
    }
    if (qStr.includes("blog") || qStr.includes("post") || qStr.includes("add")) {
      results.push({ category: "Navigation", title: "Add New Blog Post", href: "/admin/blogs/new", desc: "Write a new article" });
    }
    if (qStr.includes("affiliate") || qStr.includes("partner") || qStr.includes("request")) {
      results.push({ category: "Navigation", title: "Affiliate Overviews", href: "/admin/affiliates?view=overview", desc: "Partner statistics" });
      results.push({ category: "Navigation", title: "Affiliate Applications", href: "/admin/affiliates?view=requests", desc: "Review partner applications" });
      results.push({ category: "Navigation", title: "All Affiliates List", href: "/admin/affiliates?view=list", desc: "Manage partner accounts" });
    }
    if (qStr.includes("coupon") || qStr.includes("discount") || qStr.includes("code")) {
      results.push({ category: "Navigation", title: "Coupons & Discounts", href: "/admin/discounts", desc: "Manage coupon records" });
    }
    if (qStr.includes("order")) {
      results.push({ category: "Navigation", title: "Manage Orders", href: "/admin/orders", desc: "Check sales history" });
    }

    return results;
  }, [searchQuery, products, pages, blogs, categories, customers, orders, discounts, affiliates, promotions, reviews, scripts]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      const firstResult = searchResults[0];
      router.push(firstResult.href);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#ccd0d4] sticky top-0 z-[100] flex items-center justify-between px-6 font-sans">
      
      {/* Brand logo / home link */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-[#1d2327] hover:text-[#2271b1] transition-colors group">
          <div className="w-8 h-8 bg-[#2271b1] rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white text-base font-black italic">P</span>
          </div>
          <span className="text-[15px] font-bold tracking-tight hidden sm:block">Pairo Admin</span>
        </Link>
      </div>

      {/* Global Spotlight Search & Command Palette */}
      <div className="flex-1 max-w-[480px] mx-6 relative" ref={searchRef}>
        <div className="relative bg-[#f6f7f7] border border-[#ccd0d4] rounded-[6px] px-3 py-1.5 flex items-center gap-2 hover:border-gray-400 focus-within:border-[#2271b1] focus-within:ring-2 focus-within:ring-[#2271b1]/15 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages, products, orders..."
            className="w-full text-[13px] text-[#1d2327] bg-transparent outline-none border-none placeholder:text-gray-400"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery("")}
              className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-black shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Command Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ccd0d4] rounded-[4px] shadow-xl max-h-[380px] overflow-y-auto z-[110] divide-y divide-[#ccd0d4]">
            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs italic">
                No matching records, pages, or commands found.
              </div>
            ) : (
              searchResults.map((res, i) => (
                <Link
                  key={i}
                  href={res.href}
                  onClick={() => {
                    setShowSearchResults(false);
                    setSearchQuery("");
                  }}
                  className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-[#f6f7f7] transition-all group cursor-pointer text-left"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#1d2327] group-hover:text-[#2271b1] transition-colors">
                      {res.title}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {res.desc}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-[#2271b1]/10 text-[#2271b1] px-1.5 py-0.5 rounded-[2px] shrink-0">
                    {res.category}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Global Actions Area: Notifications & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notifications Icon (Bell) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-all ${
              showNotifications ? "bg-gray-100 text-black" : ""
            }`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#d63638] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Premium Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[340px] md:w-[400px] bg-white border border-[#ccd0d4] shadow-2xl rounded-[6px] z-[110] animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="bg-[#f6f7f7] border-b border-[#ccd0d4] px-4 py-3 flex items-center justify-between rounded-t-[6px]">
                <span className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wider">Notifications Panel</span>
                {notifications.length > 0 && (
                  <span className="bg-[#d63638] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications.length} Pending
                  </span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto divide-y divide-[#f0f0f1]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs italic">
                    No new notification events.
                  </div>
                ) : (
                  notifications.map((notice) => {
                    let typeLabel = "Info";
                    let typeColor = "bg-[#72aee6]";
                    if (notice.type === "product") { typeLabel = "Stock"; typeColor = "bg-[#d63638]"; }
                    if (notice.type === "order") { typeLabel = "Order"; typeColor = "bg-[#f0b849]"; }
                    if (notice.type === "affiliate") { typeLabel = "Affiliate"; typeColor = "bg-[#2271b1]"; }
                    
                    const isUpdating = updatingId === notice.id;
                    
                    return (
                      <div key={notice.id} className="p-4 space-y-3 hover:bg-[#f6f7f7] transition-all">
                        <div className="flex items-start gap-2.5">
                          <span className={`inline-block px-1.5 py-0.5 ${typeColor} text-white text-[9px] font-black uppercase rounded-[2px] tracking-wider shrink-0 mt-0.5`}>
                            {typeLabel}
                          </span>
                          <p className="text-[12px] text-[#2c3338] font-medium leading-relaxed">
                            {notice.text}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {notice.actions.map((act, i) => {
                            if (act.href) {
                              return (
                                <Link
                                  key={i}
                                  href={act.href}
                                  onClick={() => setShowNotifications(false)}
                                  className="border border-[#8c8f94] text-[#2271b1] hover:text-[#135e96] bg-[#f6f7f7] hover:bg-[#f0f0f1] px-2.5 py-1 rounded-[3px] text-[11px] font-bold shadow-sm transition-all"
                                >
                                  {act.label}
                                </Link>
                              );
                            }
                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={isUpdating}
                                onClick={async () => {
                                  await act.action();
                                }}
                                className={`border border-[#2271b1] text-white bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 px-2.5 py-1 rounded-[3px] text-[11px] font-bold shadow-sm transition-all cursor-pointer ${
                                  act.label === "Reject" ? "border-[#d63638] bg-[#d63638] hover:bg-[#bc0b0d]" : ""
                                }`}
                              >
                                {isUpdating ? "Processing..." : act.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onMouseEnter={() => setShowProfile(true)}
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-3 py-1 hover:text-[#2271b1] transition-colors"
          >
            <div className="w-8 h-8 bg-neutral-100 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
              <User className="w-4 h-4 text-[#8c8f94]" />
            </div>
            <span className="text-[13px] text-gray-700 font-bold hidden md:inline">
              {session?.user?.name || "Admin"}
            </span>
          </button>

          {showProfile && (
            <div
              onMouseLeave={() => setShowProfile(false)}
              className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#ccd0d4] shadow-2xl rounded-[6px] py-1.5 z-[101] text-[13px] text-gray-700 animate-in fade-in duration-100"
            >
              <div className="px-4 py-3 border-b border-[#ccd0d4]/60 bg-neutral-50/50 mb-1">
                <p className="font-bold text-black truncate">{session?.user?.name || "Administrator"}</p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-left px-4 py-2 hover:bg-[#f6f7f7] hover:text-[#2271b1] transition-all flex items-center gap-2 font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
