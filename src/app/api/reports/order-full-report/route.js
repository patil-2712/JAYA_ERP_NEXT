// // /app/api/reports/order-full-report/route.js
// import { NextResponse } from "next/server";
// import connectDb from "@/lib/db";
// import mongoose from 'mongoose';
// import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
// import OrderPanel from "../../order-panel/OrderPanel";
// import LoadingPanel from "../../loading-panel/LoadingPanel";
// import ConsignmentNote from "../../consignment-note/ConsignmentNote";
// import POD from "../../pod-panel/POD";

// function calculateDaysDifference(startDate, endDate = new Date()) {
//   if (!startDate) return 0;
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const diffTime = Math.abs(end - start);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// }

// function formatDate(date) {
//   if (!date) return '';
//   const d = new Date(date);
//   return d.toISOString().split('T')[0];
// }

// function isAuthorized(user) {
//   return (
//     user?.type === "company" ||
//     user?.role === "Admin" ||
//     user?.permissions?.includes("reports")
//   );
// }

// async function validateUser(req) {
//   const token = getTokenFromHeader(req);
//   if (!token) return { error: "Token missing", status: 401 };

//   try {
//     const user = await verifyJWT(token);
//     if (!user) return { error: "Invalid token", status: 401 };
//     if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
//     return { user, error: null, status: 200 };
//   } catch (err) {
//     console.error("JWT Verification Failed:", err?.message || err);
//     return { error: "Invalid token", status: 401 };
//   }
// }

// export async function GET(req) {
//   await connectDb();
//   const { user, error, status } = await validateUser(req);
//   if (error) {
//     return NextResponse.json({ success: false, message: error }, { status });
//   }

//   try {
//     const url = new URL(req.url);
//     const orderNo = url.searchParams.get("orderNo");
//     const fromDate = url.searchParams.get("fromDate");
//     const toDate = url.searchParams.get("toDate");
//     const partyName = url.searchParams.get("partyName");
//     const podStatus = url.searchParams.get("podStatus");
//     const orderStatus = url.searchParams.get("orderStatus");
    
//     let orderQuery = { companyId: user.companyId };
    
//     if (orderNo) {
//       orderQuery.orderPanelNo = { $regex: orderNo, $options: 'i' };
//     }
    
//     if (fromDate || toDate) {
//       orderQuery.date = {};
//       if (fromDate) orderQuery.date.$gte = new Date(fromDate);
//       if (toDate) orderQuery.date.$lte = new Date(toDate + 'T23:59:59');
//     }
    
//     if (partyName) {
//       orderQuery.$or = [
//         { partyName: { $regex: partyName, $options: 'i' } },
//         { customerName: { $regex: partyName, $options: 'i' } }
//       ];
//     }
    
//     const orderPanels = await OrderPanel.find(orderQuery)
//       .sort({ date: -1 })
//       .lean();
    
//     if (orderPanels.length === 0) {
//       return NextResponse.json({
//         success: true,
//         data: [],
//         summary: null,
//         message: "No orders found"
//       }, { status: 200 });
//     }
    
//     const orderNumbers = orderPanels.map(op => op.orderPanelNo);
    
//     const loadingPanels = await LoadingPanel.find({
//       companyId: user.companyId,
//       'orderRows.orderNo': { $in: orderNumbers }
//     }).lean();
    
//     const consignmentNotes = await ConsignmentNote.find({
//       companyId: user.companyId,
//       $or: [
//         { 'header.orderNo': { $in: orderNumbers } },
//         { loadingInfoNo: { $in: loadingPanels.map(lp => lp.vehicleArrivalNo) } }
//       ]
//     }).lean();
    
//     const pods = await POD.find({
//       companyId: user.companyId,
//       $or: [
//         { purchaseNo: { $in: orderNumbers } },
//         { 'lrEntries.orderNo': { $in: orderNumbers } }
//       ]
//     }).lean();
    
//     const loadingByOrderNo = {};
//     loadingPanels.forEach(lp => {
//       lp.orderRows?.forEach(row => {
//         if (row.orderNo) {
//           if (!loadingByOrderNo[row.orderNo]) loadingByOrderNo[row.orderNo] = [];
//           loadingByOrderNo[row.orderNo].push(lp);
//         }
//       });
//     });
    
//     const consignmentByOrderNo = {};
//     consignmentNotes.forEach(cn => {
//       const orderNoField = cn.header?.orderNo;
//       if (orderNoField) {
//         if (!consignmentByOrderNo[orderNoField]) consignmentByOrderNo[orderNoField] = [];
//         consignmentByOrderNo[orderNoField].push(cn);
//       }
//     });
    
//     const podByOrderNo = {};
//     pods.forEach(pod => {
//       const purchaseNo = pod.purchaseNo;
//       if (purchaseNo) {
//         if (!podByOrderNo[purchaseNo]) podByOrderNo[purchaseNo] = [];
//         podByOrderNo[purchaseNo].push(pod);
//       }
//       pod.lrEntries?.forEach(lr => {
//         if (lr.orderNo) {
//           if (!podByOrderNo[lr.orderNo]) podByOrderNo[lr.orderNo] = [];
//           podByOrderNo[lr.orderNo].push(pod);
//         }
//       });
//     });
    
//     const reportData = [];
    
//     for (const order of orderPanels) {
//       const orderDate = order.date || order.createdAt;
//       const orderPlacedDate = order.createdAt;
//       const orderAge = calculateDaysDifference(orderPlacedDate);
      
//       const plantRows = order.plantRows || [];
//       const locations = plantRows.map(row => row.toName || row.to || '').filter(l => l);
//       const location = locations.join(', ');
      
//       const totalWeight = order.totalWeight || plantRows.reduce((sum, row) => sum + (row.weight || 0), 0);
      
//       const otherCharges = (order.collectionCharges || 0) + 
//                           (parseFloat(order.cancellationCharges) || 0) + 
//                           (order.loadingCharges === 'Nil' ? 0 : parseFloat(order.loadingCharges) || 0) + 
//                           (order.otherCharges || 0);
      
//       const totalAmount = order.totalAmount || 0;
      
//       const relatedConsignments = consignmentByOrderNo[order.orderPanelNo] || [];
//       const lrNumbers = relatedConsignments.map(cn => cn.lrNo).filter(l => l);
//       const lrNo = lrNumbers.join(', ') || 'Not Generated';
      
//       const relatedPods = podByOrderNo[order.orderPanelNo] || [];
//       const invoiceNos = [];
//       relatedPods.forEach(pod => {
//         pod.lrEntries?.forEach(lr => {
//           if (lr.docketNo) invoiceNos.push(lr.docketNo);
//         });
//       });
//       const invoiceNo = invoiceNos.join(', ') || 'Not Generated';
      
//       const relatedLoadings = loadingByOrderNo[order.orderPanelNo] || [];
//       let vehiclePlacedDate = '';
//       let vehicleLeftWarehouse = '';
//       let advAmount = 0;
//       let additionalCharges = 0;
//       let balance = 0;
      
//       if (relatedLoadings.length > 0) {
//         const loading = relatedLoadings[0];
//         vehiclePlacedDate = loading.arrivalDetails?.date ? formatDate(loading.arrivalDetails.date) : '';
//         vehicleLeftWarehouse = loading.arrivalDetails?.outDate ? formatDate(loading.arrivalDetails.outDate) : '';
        
//         const podForOrder = relatedPods[0];
//         if (podForOrder) {
//           advAmount = podForOrder.vendorFinancial?.advance || 0;
//           additionalCharges = podForOrder.podDeduction || 0;
//           balance = podForOrder.vendorFinancial?.finalBalance || 0;
//         }
//       }
      
//       let podStatusValue = 'Pending';
//       let podRemark = '';
//       if (relatedPods.length > 0) {
//         const pod = relatedPods[0];
//         podStatusValue = pod.podStatus || 'Pending';
//         podRemark = pod.podStatusSection?.note || pod.remarks || '';
//       }
      
//       let orderStatusValue = order.panelStatus || 'Draft';
//       if (orderStatus && orderStatusValue !== orderStatus) continue;
//       if (podStatus && podStatusValue !== podStatus) continue;
      
//       let statusAdAmt = 'Pending';
//       if (advAmount > 0 && advAmount < totalAmount) statusAdAmt = 'Partial';
//       if (advAmount >= totalAmount) statusAdAmt = 'Completed';
      
//       let statusBalance = 'Pending';
//       if (balance > 0 && balance < totalAmount) statusBalance = 'Partial';
//       if (balance <= 0) statusBalance = 'Cleared';
      
//       reportData.push({
//         partyName: order.partyName || order.customerName || 'N/A',
//         company: order.branchName || 'N/A',
//         vendorName: order.customerName || 'N/A',
//         orderNo: order.orderPanelNo,
//         orderReceivedDate: formatDate(orderDate),
//         orderPlaced: formatDate(orderPlacedDate),
//         orderAgeDays: orderAge,
//         locationTo: location || 'N/A',
//         weightMT: totalWeight,
//         otherCharges: otherCharges,
//         totalAmount: totalAmount,
//         lrNo: lrNo,
//         invoiceNo: invoiceNo,
//         vehiclePlacedDate: vehiclePlacedDate,
//         vehicleLeftWarehouse: vehicleLeftWarehouse,
//         advAmount: advAmount,
//         statusAdAmt: statusAdAmt,
//         additionalCharges: additionalCharges,
//         balance: balance,
//         statusBalance: statusBalance,
//         podStatus: podStatusValue,
//         podRemark: podRemark,
//         orderStatus: orderStatusValue
//       });
//     }
    
//     const summary = {
//       totalOrders: reportData.length,
//       totalWeight: reportData.reduce((sum, item) => sum + item.weightMT, 0),
//       totalAmount: reportData.reduce((sum, item) => sum + item.totalAmount, 0),
//       totalAdvAmount: reportData.reduce((sum, item) => sum + item.advAmount, 0),
//       totalBalance: reportData.reduce((sum, item) => sum + item.balance, 0),
//       avgOrderAge: Math.round(reportData.reduce((sum, item) => sum + item.orderAgeDays, 0) / (reportData.length || 1)),
//       ordersByStatus: {
//         Draft: reportData.filter(i => i.orderStatus === 'Draft').length,
//         Submitted: reportData.filter(i => i.orderStatus === 'Submitted').length,
//         Approved: reportData.filter(i => i.orderStatus === 'Approved').length,
//         Completed: reportData.filter(i => i.orderStatus === 'Completed').length,
//         Cancelled: reportData.filter(i => i.orderStatus === 'Cancelled').length
//       },
//       podStatusSummary: {
//         Pending: reportData.filter(i => i.podStatus === 'Pending').length,
//         Received: reportData.filter(i => i.podStatus === 'Received').length,
//         Partial: reportData.filter(i => i.podStatus === 'Partial').length,
//         Rejected: reportData.filter(i => i.podStatus === 'Rejected').length
//       }
//     };
    
//     return NextResponse.json({
//       success: true,
//       summary,
//       data: reportData,
//       totalCount: reportData.length
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error("❌ GET /reports/order-full-report error:", error);
//     return NextResponse.json({
//       success: false,
//       message: error.message || "Failed to generate report"
//     }, { status: 500 });
//   }
// }

// /app/api/reports/order-full-report/route.js
import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import mongoose from 'mongoose';
import { getTokenFromHeader, verifyJWT } from "@/lib/auth";
import OrderPanel from "../../order-panel/OrderPanel";
import LoadingPanel from "../../loading-panel/LoadingPanel";
import ConsignmentNote from "../../consignment-note/ConsignmentNote";
import POD from "../../pod-panel/POD";

function calculateDaysDifference(startDate, endDate = new Date()) {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function isAuthorized(user) {
  return (
    user?.type === "company" ||
    user?.role === "Admin" ||
    user?.permissions?.includes("reports")
  );
}

async function validateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) return { error: "Token missing", status: 401 };

  try {
    const user = await verifyJWT(token);
    if (!user) return { error: "Invalid token", status: 401 };
    if (!isAuthorized(user)) return { error: "Unauthorized", status: 403 };
    return { user, error: null, status: 200 };
  } catch (err) {
    console.error("JWT Verification Failed:", err?.message || err);
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req) {
  await connectDb();
  const { user, error, status } = await validateUser(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  try {
    const url = new URL(req.url);
    const orderNo = url.searchParams.get("orderNo");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const partyName = url.searchParams.get("partyName");
    const podStatus = url.searchParams.get("podStatus");
    const orderStatus = url.searchParams.get("orderStatus");
    
    let orderQuery = { companyId: user.companyId };
    
    if (orderNo) {
      orderQuery.orderPanelNo = { $regex: orderNo, $options: 'i' };
    }
    
    if (fromDate || toDate) {
      orderQuery.date = {};
      if (fromDate) orderQuery.date.$gte = new Date(fromDate);
      if (toDate) orderQuery.date.$lte = new Date(toDate + 'T23:59:59');
    }
    
    if (partyName) {
      orderQuery.$or = [
        { partyName: { $regex: partyName, $options: 'i' } },
        { customerName: { $regex: partyName, $options: 'i' } }
      ];
    }
    
    const orderPanels = await OrderPanel.find(orderQuery)
      .sort({ date: -1 })
      .lean();
    
    if (orderPanels.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        summary: null,
        message: "No orders found"
      }, { status: 200 });
    }
    
    const orderNumbers = orderPanels.map(op => op.orderPanelNo);
    
    // Fetch related data
    const loadingPanels = await LoadingPanel.find({
      companyId: user.companyId,
      'orderRows.orderNo': { $in: orderNumbers }
    }).lean();
    
    const consignmentNotes = await ConsignmentNote.find({
      companyId: user.companyId,
      $or: [
        { 'header.orderNo': { $in: orderNumbers } },
        { loadingInfoNo: { $in: loadingPanels.map(lp => lp.vehicleArrivalNo) } }
      ]
    }).lean();
    
    const pods = await POD.find({
      companyId: user.companyId,
      $or: [
        { purchaseNo: { $in: orderNumbers } },
        { 'lrEntries.orderNo': { $in: orderNumbers } }
      ]
    }).lean();
    
    // Build indexes for quick lookup
    const loadingByOrderNo = {};
    loadingPanels.forEach(lp => {
      lp.orderRows?.forEach(row => {
        if (row.orderNo) {
          if (!loadingByOrderNo[row.orderNo]) loadingByOrderNo[row.orderNo] = [];
          loadingByOrderNo[row.orderNo].push(lp);
        }
      });
    });
    
    const consignmentByOrderNo = {};
    consignmentNotes.forEach(cn => {
      const orderNoField = cn.header?.orderNo;
      if (orderNoField) {
        if (!consignmentByOrderNo[orderNoField]) consignmentByOrderNo[orderNoField] = [];
        consignmentByOrderNo[orderNoField].push(cn);
      }
    });
    
    const podByOrderNo = {};
    pods.forEach(pod => {
      const purchaseNo = pod.purchaseNo;
      if (purchaseNo) {
        if (!podByOrderNo[purchaseNo]) podByOrderNo[purchaseNo] = [];
        podByOrderNo[purchaseNo].push(pod);
      }
      pod.lrEntries?.forEach(lr => {
        if (lr.orderNo) {
          if (!podByOrderNo[lr.orderNo]) podByOrderNo[lr.orderNo] = [];
          podByOrderNo[lr.orderNo].push(pod);
        }
      });
    });
    
    const reportData = [];
    
    for (const order of orderPanels) {
      const orderDate = order.date || order.createdAt;
      const orderPlacedDate = order.createdAt;
      const orderAge = calculateDaysDifference(orderPlacedDate);
      
      const plantRows = order.plantRows || [];
      const locations = plantRows.map(row => row.toName || row.to || '').filter(l => l);
      const location = locations.join(', ');
      
      const totalWeight = order.totalWeight || plantRows.reduce((sum, row) => sum + (row.weight || 0), 0);
      
      const otherCharges = (order.collectionCharges || 0) + 
                          (parseFloat(order.cancellationCharges) || 0) + 
                          (order.loadingCharges === 'Nil' ? 0 : parseFloat(order.loadingCharges) || 0) + 
                          (order.otherCharges || 0);
      
      const totalAmount = order.totalAmount || 0;
      
      const relatedConsignments = consignmentByOrderNo[order.orderPanelNo] || [];
      const lrNumbers = relatedConsignments.map(cn => cn.lrNo).filter(l => l);
      const lrNo = lrNumbers.join(', ') || 'Not Generated';
      
      const relatedPods = podByOrderNo[order.orderPanelNo] || [];
      const invoiceNos = [];
      relatedPods.forEach(pod => {
        pod.lrEntries?.forEach(lr => {
          if (lr.docketNo) invoiceNos.push(lr.docketNo);
        });
      });
      const invoiceNo = invoiceNos.join(', ') || 'Not Generated';
      
      const relatedLoadings = loadingByOrderNo[order.orderPanelNo] || [];
      let vehiclePlacedDate = '';
      let vehicleLeftWarehouse = '';
      
      if (relatedLoadings.length > 0) {
        const loading = relatedLoadings[0];
        vehiclePlacedDate = loading.arrivalDetails?.date ? formatDate(loading.arrivalDetails.date) : '';
        vehicleLeftWarehouse = loading.arrivalDetails?.outDate ? formatDate(loading.arrivalDetails.outDate) : '';
      }
      
      // Get POD data for this order
      let advAmount = 0;
      let additionalCharges = 0;
      let balance = 0;
      let podStatusValue = 'Pending';
      let podRemark = '';
      let podDeduction = 0;
      let poDeduction = 0;
      let totalPODAmount = 0;
      
      if (relatedPods.length > 0) {
        const pod = relatedPods[0];
        
        // Get advance amount from vendorFinancial
        advAmount = pod.vendorFinancial?.advance || 0;
        
        // Get POD deduction (additional charges)
        podDeduction = pod.vendorFinancial?.podDeduction || pod.podDeduction || 0;
        poDeduction = pod.vendorFinancial?.poDeduction || 0;
        
        // Additional Charges = POD Deduction + PO Deduction
        additionalCharges = podDeduction + poDeduction;
        
        // Total amount from vendorFinancial
        totalPODAmount = pod.vendorFinancial?.total || 0;
        
        // Balance = Total - Advance - Additional Charges
        balance = totalPODAmount - advAmount - additionalCharges;
        
        // Get POD status
        podStatusValue = pod.podStatus || pod.podStatusSection?.podStatus || 'Pending';
        podRemark = pod.podStatusSection?.note || pod.remarks || '';
      }
      
      // Calculate Status (Ad amt) - Advance Payment Status
      let statusAdAmt = 'Pending';
      if (advAmount > 0 && advAmount < totalPODAmount) statusAdAmt = 'Partial';
      if (advAmount >= totalPODAmount && totalPODAmount > 0) statusAdAmt = 'Completed';
      if (advAmount === 0) statusAdAmt = 'Pending';
      
      // Calculate Status (Balance)
      let statusBalance = 'Pending';
      if (balance > 0 && balance < totalPODAmount) statusBalance = 'Partial';
      if (balance <= 0) statusBalance = 'Cleared';
      if (balance === totalPODAmount) statusBalance = 'Pending';
      
      let orderStatusValue = order.panelStatus || 'Draft';
      
      // Apply filters
      if (orderStatus && orderStatusValue !== orderStatus) continue;
      if (podStatus && podStatusValue !== podStatus) continue;
      
      reportData.push({
        // Basic Information
        partyName: order.partyName || order.customerName || 'N/A',
        company: order.branchName || 'N/A',
        vendorName: order.customerName || 'N/A',
        orderNo: order.orderPanelNo,
        
        // Dates
        orderReceivedDate: formatDate(orderDate),
        orderPlaced: formatDate(orderPlacedDate),
        orderAgeDays: orderAge,
        
        // Location & Weight
        locationTo: location || 'N/A',
        weightMT: totalWeight,
        
        // Financial
        otherCharges: otherCharges,
        totalAmount: totalAmount,
        
        // Documents
        lrNo: lrNo,
        invoiceNo: invoiceNo,
        
        // Vehicle Information
        vehiclePlacedDate: vehiclePlacedDate,
        vehicleLeftWarehouse: vehicleLeftWarehouse,
        
        // Payment Status - FIXED
        advAmount: advAmount,
        statusAdAmt: statusAdAmt,
        additionalCharges: additionalCharges,
        balance: balance,
        statusBalance: statusBalance,
        
        // POD Status - FIXED
        podStatus: podStatusValue,
        podRemark: podRemark,
        
        // Order Status
        orderStatus: orderStatusValue,
        
        // Detailed breakdown for debugging
        _details: {
          totalPODAmount: totalPODAmount,
          podDeduction: podDeduction,
          poDeduction: poDeduction,
          relatedPodsCount: relatedPods.length
        }
      });
    }
    
    // Calculate summary
    const summary = {
      totalOrders: reportData.length,
      totalWeight: reportData.reduce((sum, item) => sum + item.weightMT, 0),
      totalAmount: reportData.reduce((sum, item) => sum + item.totalAmount, 0),
      totalAdvAmount: reportData.reduce((sum, item) => sum + item.advAmount, 0),
      totalBalance: reportData.reduce((sum, item) => sum + Math.max(0, item.balance), 0),
      totalAdditionalCharges: reportData.reduce((sum, item) => sum + item.additionalCharges, 0),
      avgOrderAge: Math.round(reportData.reduce((sum, item) => sum + item.orderAgeDays, 0) / (reportData.length || 1)),
      ordersByStatus: {
        Draft: reportData.filter(i => i.orderStatus === 'Draft').length,
        Submitted: reportData.filter(i => i.orderStatus === 'Submitted').length,
        Approved: reportData.filter(i => i.orderStatus === 'Approved').length,
        Completed: reportData.filter(i => i.orderStatus === 'Completed').length,
        Cancelled: reportData.filter(i => i.orderStatus === 'Cancelled').length
      },
      podStatusSummary: {
        Pending: reportData.filter(i => i.podStatus === 'Pending').length,
        Received: reportData.filter(i => i.podStatus === 'Received').length,
        Partial: reportData.filter(i => i.podStatus === 'Partial').length,
        Rejected: reportData.filter(i => i.podStatus === 'Rejected').length,
        'Clear & Ok': reportData.filter(i => i.podStatus === 'Clear & Ok').length,
        Deductions: reportData.filter(i => i.podStatus === 'Deductions').length
      },
      paymentStatusSummary: {
        Pending: reportData.filter(i => i.statusAdAmt === 'Pending').length,
        Partial: reportData.filter(i => i.statusAdAmt === 'Partial').length,
        Completed: reportData.filter(i => i.statusAdAmt === 'Completed').length
      },
      balanceStatusSummary: {
        Pending: reportData.filter(i => i.statusBalance === 'Pending').length,
        Partial: reportData.filter(i => i.statusBalance === 'Partial').length,
        Cleared: reportData.filter(i => i.statusBalance === 'Cleared').length
      }
    };
    
    return NextResponse.json({
      success: true,
      summary,
      data: reportData,
      totalCount: reportData.length
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ GET /reports/order-full-report error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to generate report"
    }, { status: 500 });
  }
}