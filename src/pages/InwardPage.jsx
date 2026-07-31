import React, { useState, useEffect } from "react";
import {
  FileDown,
  Calendar as CalendarIcon,
  Building2,
  PackageSearch,
  Hash,
  Truck,
  CheckCircle2,
  UserCheck,
  FileText,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  SlidersHorizontal,
  ArrowLeft,
  AlertCircle,
  ShoppingCart,
  ClipboardCheck,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import {
  Input,
  Spinner,
  DatePicker,
  DateField,
  Calendar,
  Select,
  ListBox,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StatsCard from "../components/common/StatsCard";
import TableToolbar from "../components/common/TableToolbar";
import DataTable from "../components/common/DataTable";
import TableFooter from "../components/common/TableFooter";
import EditableCreatableSelect from "../components/common/EditableCreatableSelect";
import { useInwardStore } from "../store/inwardStore";
import { useAuthStore } from "../store/authStore";
import { usePartyMasterStore } from "../store/partyMasterStore";
import { usePurchaseOrderStore } from "../store/purchaseOrderStore";
import { useEmployeeMasterStore } from "../store/employeeMasterStore";

const todayIsoDate = () => new Date().toISOString().split("T")[0];

const EMPTY_ENTRY = {
  // A
  grn_no: "",
  receipt_date: todayIsoDate(),
  receipt_time: "",
  vehicle_no: "",
  total_packages: "",
  vendor_name: "",
  vendor_code: "",
  po_no: "",
  po_date: "",
  non_po_approval: "",
  invoice_no: "",
  invoice_date: "",
  transporter: "",
  lr_gr_no: "",
  lr_gr_date: "",
  // B
  materials: [
    {
      item_code: "",
      description: "",
      batch_no: "",
      mfg_date: "",
      uom: "KG",
      pack_size_qty: "",
      no_of_packs: "",
      po_qty: "",
      received_qty: "",
      accepted_qty: "",
      rejected_qty: "",
      remarks: "",
    },
  ],
  // C
  invoice_received: "",
  challan_received: "",
  tc_coa_received: "",
  packaging_condition: "",
  qc_status: "",
  tc_coa_no: "",
  tc_coa_date: "",
  discrepancy_type: "",
  discrepancy_note_no: "",
  storage_location: "",
  quarantine_required: "",
  final_qc_decision_by: "",
  detailed_qc_remarks: "",
  // D
  qc_verified_status: "",
  qc_verified_name: "",
  qc_verified_datetime: "",
  qc_verified_remarks: "",
  qty_verified_status: "",
  qty_verified_name: "",
  qty_verified_datetime: "",
  qty_verified_remarks: "",
  recv_verified_status: "",
  recv_verified_name: "",
  recv_verified_datetime: "",
  recv_verified_remarks: "",
  auth_verified_status: "",
  auth_verified_name: "",
  auth_verified_datetime: "",
  auth_verified_remarks: "",
};

const materialSchema = z.object({
  item_code: z.string().optional(),
  description: z.string().optional(),
  batch_no: z.string().optional(),
  mfg_date: z.string().optional(),
  uom: z.string().optional(),
  pack_size_qty: z.string().optional(),
  no_of_packs: z.string().optional(),
  po_qty: z.string().optional(),
  received_qty: z.string().optional(),
  accepted_qty: z.string().optional(),
  rejected_qty: z.string().optional(),
  remarks: z.string().optional(),
});

const inwardSchema = z.object({
  grn_no: z.string().min(1, "GRN No is required"),
  receipt_date: z.string().optional(),
  receipt_time: z.string().optional(),
  vehicle_no: z.string().optional(),
  total_packages: z.string().optional(),
  vendor_name: z.string().min(1, "Vendor name is required"),
  vendor_code: z.string().optional(),
  po_no: z.string().optional(),
  po_date: z.string().optional(),
  non_po_approval: z.string().optional(),
  invoice_no: z.string().optional(),
  invoice_date: z.string().optional(),
  transporter: z.string().optional(),
  lr_gr_no: z.string().optional(),
  lr_gr_date: z.string().optional(),

  materials: z.array(materialSchema).optional(),

  invoice_received: z.string().optional(),
  challan_received: z.string().optional(),
  tc_coa_received: z.string().optional(),
  packaging_condition: z.string().optional(),
  qc_status: z.string().optional(),
  tc_coa_no: z.string().optional(),
  tc_coa_date: z.string().optional(),
  discrepancy_type: z.string().optional(),
  discrepancy_note_no: z.string().optional(),
  storage_location: z.string().optional(),
  quarantine_required: z.string().optional(),
  final_qc_decision_by: z.string().optional(),
  detailed_qc_remarks: z.string().optional(),

  qc_verified_status: z.string().optional(),
  qc_verified_name: z.string().optional(),
  qc_verified_datetime: z.string().optional(),
  qc_verified_remarks: z.string().optional(),

  qty_verified_status: z.string().optional(),
  qty_verified_name: z.string().optional(),
  qty_verified_datetime: z.string().optional(),
  qty_verified_remarks: z.string().optional(),

  recv_verified_status: z.string().optional(),
  recv_verified_name: z.string().optional(),
  recv_verified_datetime: z.string().optional(),
  recv_verified_remarks: z.string().optional(),

  auth_verified_status: z.string().optional(),
  auth_verified_name: z.string().optional(),
  auth_verified_datetime: z.string().optional(),
  auth_verified_remarks: z.string().optional(),
});

const baseInputClass =
  "w-full text-[13px] font-medium rounded-xl text-slate-800 border bg-white transition-all outline-none border-slate-200 focus:border-emerald-500/50 input-glow disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
const inputCls = `${baseInputClass} px-4 py-3 h-[46px]`;
const selectCls = `${baseInputClass} px-4 py-3 h-[46px]`;

function Section({ title, children, icon: Icon, className = "" }) {
  return (
    <div
      className={`mb-8 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        {Icon && (
          <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Icon size={15} className="text-emerald-600" />
          </div>
        )}
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Field({ label, children, required, error, colClass = "col-span-1" }) {
  return (
    <label className={`flex flex-col gap-2 relative ${colClass}`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>
      )}
    </label>
  );
}

function TableInput({ field, isView, align = "left", placeholder = "" }) {
  return (
    <Input
      {...field}
      placeholder={placeholder}
      disabled={isView}
      className={`w-full h-9 px-2 text-[12px] font-medium border border-transparent hover:border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 disabled:text-slate-600 text-${align} ${isView ? "bg-transparent" : "bg-white"}`}
    />
  );
}

function CustomDatePicker({ field, isView, label, isCompact = false }) {
  const dateValue =
    field.value && typeof field.value === "string"
      ? field.value.split("T")[0]
      : "";
  const heightClass = isCompact ? "h-9" : "h-[46px]";
  const groupClass = isCompact
    ? `w-full border border-transparent hover:border-slate-300 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 transition-all ${isView ? "bg-transparent" : "bg-white"}`
    : baseInputClass;
  return (
    <DatePicker
      value={dateValue ? parseDate(dateValue) : null}
      isDisabled={isView}
      onChange={(dateVal) => field.onChange(dateVal ? dateVal.toString() : "")}
      className="w-full"
      aria-label={label}
    >
      <DateField.Group
        className={`${groupClass} flex items-center overflow-hidden ${heightClass}`}
        fullWidth
      >
        <DateField.Input
          className={`flex-1 py-1 ${isCompact ? "px-2 text-[12px]" : "px-4 text-[13px]"} outline-none bg-transparent`}
        >
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix className="pr-2">
          <DatePicker.Trigger className="text-slate-500 hover:text-emerald-600 transition-colors">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label={label}>
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({ year }) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

function CustomSelect({
  field,
  isView,
  options,
  placeholder = "Select...",
  isCompact = false,
}) {
  const heightClass = isCompact ? "h-9" : "h-[46px]";
  const groupClass = isCompact
    ? `w-full border border-slate-200 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 transition-all shadow-sm ${isView ? "bg-transparent border-transparent shadow-none" : "bg-white hover:border-slate-300"}`
    : baseInputClass;
  const paddingClass = isCompact
    ? "px-2 py-1 text-[12px]"
    : "px-4 py-3 text-[13px]";

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string"
      ? { id: opt, textValue: opt }
      : { id: opt.value, textValue: opt.label },
  );

  return (
    <Select
      selectedKeys={field.value ? new Set([field.value]) : new Set()}
      onSelectionChange={(keys) => {
        const val = keys instanceof Set ? Array.from(keys)[0] : keys;
        field.onChange(val || "");
      }}
      isDisabled={isView}
      className="w-full"
      placeholder={placeholder}
      aria-label={placeholder}
    >
      <Select.Trigger
        className={`${groupClass} flex items-center justify-between outline-none ${heightClass} ${paddingClass}`}
      >
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {normalizedOptions.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.textValue}>
              {opt.textValue}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function MaterialDetailsTable({
  control,
  isView,
  watch,
  setValue,
  poItems = [],
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "materials",
  });
  const materials = watch("materials");

  useEffect(() => {
    if (!materials || isView) return;
    materials.forEach((mat, index) => {
      const packSize = parseFloat(mat.pack_size_qty);
      const noOfPacks = parseFloat(mat.no_of_packs);
      let calculatedReceived = mat.received_qty;

      if (!isNaN(packSize) && !isNaN(noOfPacks)) {
        const newReceived = (packSize * noOfPacks).toString();
        if (mat.received_qty !== newReceived) {
          setValue(`materials.${index}.received_qty`, newReceived);
          calculatedReceived = newReceived;
        }
      }

      const receivedQty = parseFloat(calculatedReceived);
      const acceptedQty = parseFloat(mat.accepted_qty);

      if (!isNaN(receivedQty) && !isNaN(acceptedQty)) {
        const newRejected = (receivedQty - acceptedQty).toString();
        if (mat.rejected_qty !== newRejected) {
          setValue(`materials.${index}.rejected_qty`, newRejected);
        }
      }
    });
  }, [materials, setValue, isView]);

  const totalNoOfPacks =
    materials?.reduce(
      (acc, curr) => acc + (parseFloat(curr.no_of_packs) || 0),
      0,
    ) || 0;
  const totalPoQty =
    materials?.reduce((acc, curr) => acc + (parseFloat(curr.po_qty) || 0), 0) ||
    0;
  const totalReceivedQty =
    materials?.reduce(
      (acc, curr) => acc + (parseFloat(curr.received_qty) || 0),
      0,
    ) || 0;
  const totalAcceptedQty =
    materials?.reduce(
      (acc, curr) => acc + (parseFloat(curr.accepted_qty) || 0),
      0,
    ) || 0;
  const totalRejectedQty =
    materials?.reduce(
      (acc, curr) => acc + (parseFloat(curr.rejected_qty) || 0),
      0,
    ) || 0;

  return (
    <div className="overflow-x-auto w-full rounded-lg border border-slate-200">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="bg-slate-100/70 border-b border-slate-200">
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200 w-[50px] text-center">
              Sr.
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Item Code
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200 min-w-[200px]">
              Description / Grade
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Batch / Lot No.
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Mfg Date
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              UOM
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Pack Size Qty
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              No. of Packs
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-emerald-700 uppercase border-r border-emerald-100 bg-emerald-50">
              PO Qty
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-emerald-700 uppercase border-r border-emerald-100 bg-emerald-100/50">
              Received Qty
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-emerald-700 uppercase border-r border-emerald-100 bg-emerald-100/50">
              Accepted Qty
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-red-700 uppercase border-r border-red-100 bg-red-50">
              Rejected Qty
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-600">
              Remarks
            </th>
            {!isView && (
              <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase w-[50px] text-center">
                Del
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white">
          {fields.map((field, index) => (
            <tr
              key={field.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="p-1 border-r border-slate-100 text-center text-[11px] font-bold text-slate-500 bg-slate-50">
                {index + 1}
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.item_code`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.description`}
                  render={({ field: { onChange, value } }) =>
                    isView ? (
                      <TableInput field={{ value, onChange }} isView={true} />
                    ) : (
                      <select
                        value={value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange(val);
                          if (!val) return;
                          const matchedItem = poItems.find(
                            (i) => i.productName === val,
                          );
                          if (matchedItem) {
                            if (matchedItem.partNo)
                              setValue(
                                `materials.${index}.item_code`,
                                matchedItem.partNo,
                                { shouldValidate: true, shouldDirty: true },
                              );
                            if (matchedItem.uom)
                              setValue(
                                `materials.${index}.uom`,
                                matchedItem.uom,
                                { shouldValidate: true, shouldDirty: true },
                              );
                            if (matchedItem.orderQty)
                              setValue(
                                `materials.${index}.po_qty`,
                                matchedItem.orderQty.toString(),
                                { shouldValidate: true, shouldDirty: true },
                              );
                          }
                        }}
                        className="w-full h-9 px-2 text-[12px] font-medium border border-transparent hover:border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 bg-white cursor-pointer"
                      >
                        <option value="">-- Select Product --</option>
                        {poItems.map((item, i) => (
                          <option key={i} value={item.productName}>
                            {item.productName}
                          </option>
                        ))}
                      </select>
                    )
                  }
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.batch_no`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.mfg_date`}
                  render={({ field }) => (
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="Mfg Date"
                      isCompact={true}
                    />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.uom`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.pack_size_qty`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} align="right" />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.no_of_packs`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} align="right" />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100 bg-emerald-50/20">
                <Controller
                  control={control}
                  name={`materials.${index}.po_qty`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled
                      readOnly
                      value={field.value || ""}
                      className="w-full h-9 px-2 text-[12px] font-medium border-transparent text-right bg-transparent cursor-not-allowed text-slate-500"
                      placeholder="Auto"
                    />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100 bg-emerald-50/20">
                <Controller
                  control={control}
                  name={`materials.${index}.received_qty`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} align="right" />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100 bg-emerald-50/20">
                <Controller
                  control={control}
                  name={`materials.${index}.accepted_qty`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} align="right" />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100 bg-red-50/20">
                <Controller
                  control={control}
                  name={`materials.${index}.rejected_qty`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} align="right" />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`materials.${index}.remarks`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} />
                  )}
                />
              </td>
              {!isView && (
                <td className="p-1 text-center bg-white">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold text-[12px]">
            <td
              colSpan={7}
              className="p-2 text-right border-r border-slate-200 text-slate-700"
            >
              Total
            </td>
            <td className="p-2 text-right border-r border-slate-200 text-slate-700">
              {totalNoOfPacks.toFixed(2)}
            </td>
            <td className="p-2 text-right border-r border-slate-200 text-emerald-700">
              {totalPoQty.toFixed(2)}
            </td>
            <td className="p-2 text-right border-r border-slate-200 text-emerald-700">
              {totalReceivedQty.toFixed(2)}
            </td>
            <td className="p-2 text-right border-r border-slate-200 text-emerald-700">
              {totalAcceptedQty.toFixed(2)}
            </td>
            <td className="p-2 text-right border-r border-slate-200 text-red-700">
              {totalRejectedQty.toFixed(2)}
            </td>
            <td colSpan={isView ? 1 : 2} className="p-2"></td>
          </tr>
        </tfoot>
      </table>
      {!isView && (
        <div className="p-3 bg-white border-t border-slate-200">
          <button
            type="button"
            onClick={() => append({ uom: "KG" })}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <Plus size={14} /> Add Material Row
          </button>
        </div>
      )}
    </div>
  );
}

function VerificationTable({ control, isView, employees = [] }) {
  const rows = [
    { label: "Quality Verified by - QC", prefix: "qc_verified" },
    { label: "Quantity Verified by", prefix: "qty_verified" },
    { label: "Received by - Stores", prefix: "recv_verified" },
    { label: "Authorised by", prefix: "auth_verified" },
  ];

  return (
    <div className="overflow-x-auto w-full rounded-lg border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-100/70 border-b border-slate-200">
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200 min-w-[200px]">
              Verification Point
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Status
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Name
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase border-r border-slate-200">
              Date & Time
            </th>
            <th className="py-2.5 px-3 text-[11px] font-bold text-slate-600 uppercase">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="py-2 px-4 border-r border-slate-100 text-[12px] font-bold text-slate-700 bg-slate-50">
                {row.label}
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`${row.prefix}_status`}
                  render={({ field }) => (
                    <CustomSelect
                      field={field}
                      isView={isView}
                      isCompact={true}
                      options={["Approved", "Reject", "Hold"]}
                    />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`${row.prefix}_name`}
                  render={({ field }) => (
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={employees
                        .map((emp) => emp.employeeName)
                        .filter(Boolean)}
                      placeholder="Select Employee"
                    />
                  )}
                />
              </td>
              <td className="p-1 border-r border-slate-100">
                <Controller
                  control={control}
                  name={`${row.prefix}_datetime`}
                  render={({ field }) => (
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="Date"
                      isCompact={true}
                    />
                  )}
                />
              </td>
              <td className="p-1">
                <Controller
                  control={control}
                  name={`${row.prefix}_remarks`}
                  render={({ field }) => (
                    <TableInput field={field} isView={isView} />
                  )}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InwardForm({ mode, entry, onBack }) {
  const { addEntry, updateEntry, entries } = useInwardStore();
  const { currentOrg, currentUser } = useAuthStore();
  const { parties, fetchParties } = usePartyMasterStore();
  const { orders: purchaseOrders, fetchOrders } = usePurchaseOrderStore();
  const { employees, fetchEmployees } = useEmployeeMasterStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchParties(currentOrg.id);
      fetchOrders(currentOrg.id);
      fetchEmployees(currentOrg.id);
    }
  }, [currentOrg?.id, fetchParties, fetchOrders, fetchEmployees]);

  const vendorOptions = React.useMemo(() => {
    if (!parties) return [];
    const options = parties
      .filter((p) => p.partyCategory === "Vendor")
      .map((p) => ({
        value: p.partyName,
        label: p.partyName,
        code: p.partyCode,
      }));

    if (
      entry?.vendor_name &&
      !options.some((o) => o.value === entry.vendor_name)
    ) {
      options.push({
        value: entry.vendor_name,
        label: entry.vendor_name,
        code: entry.vendor_code || "",
      });
    }
    return options;
  }, [parties, entry]);

  const storageLocationOptions = React.useMemo(() => {
    if (!entries) return [];
    return Array.from(
      new Set(entries.map((e) => e.storage_location).filter(Boolean)),
    ).sort();
  }, [entries]);

  const isView = mode === "view";
  const isAdd = mode === "add";

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inwardSchema),
    defaultValues: entry || EMPTY_ENTRY,
  });

  const vendorName = watch("vendor_name");
  const poNo = watch("po_no");

  const poOptions = React.useMemo(() => {
    if (!vendorName || !purchaseOrders) return [];
    return purchaseOrders
      .filter((o) => o.vendorName === vendorName && o.npplPoNo)
      .map((o) => o.npplPoNo)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [vendorName, purchaseOrders]);

  const poItems = React.useMemo(() => {
    if (!poNo || !vendorName || !purchaseOrders) return [];
    const matchedPO = purchaseOrders.find(
      (o) => o.npplPoNo === poNo && o.vendorName === vendorName,
    );
    return matchedPO?.items || [];
  }, [poNo, vendorName, purchaseOrders]);

  useEffect(() => {
    if (!isView && vendorName) {
      const selectedVendor = vendorOptions.find(
        (v) => String(v.value) === String(vendorName),
      );
      if (selectedVendor && selectedVendor.code) {
        if (getValues("vendor_code") !== selectedVendor.code) {
          setValue("vendor_code", selectedVendor.code, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      } else {
        if (getValues("vendor_code") !== "") {
          setValue("vendor_code", "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  }, [vendorName, vendorOptions, setValue, getValues, isView]);

  useEffect(() => {
    if (isAdd && (!entry || !entry.grn_no)) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      const shortYear = year.toString().slice(-2);
      const yearPrefix =
        month >= 3
          ? `${shortYear}-${(year + 1).toString().slice(-2)}`
          : `${(year - 1).toString().slice(-2)}-${shortYear}`;

      const prefix = `NPPL/GRN${yearPrefix}/`;
      let maxNum = 0;
      if (entries && entries.length > 0) {
        entries.forEach((e) => {
          if (e.grn_no && e.grn_no.startsWith(prefix)) {
            const numPart = e.grn_no.split("/").pop();
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }
      const nextNum = (maxNum + 1).toString().padStart(4, "0");
      const nextGrn = `${prefix}${nextNum}`;

      reset({ ...(entry || EMPTY_ENTRY), grn_no: nextGrn });
    } else {
      reset(entry || EMPTY_ENTRY);
    }
  }, [entry, reset, isAdd, entries]);

  const onSubmit = async (data) => {
    const sanitizeDate = (val) => (val === "" ? null : val);
    const sanitizeNumber = (val) => (val === "" ? null : Number(val));

    const sanitizedData = {
      ...data,
      total_packages: sanitizeNumber(data.total_packages),
      receipt_date: sanitizeDate(data.receipt_date),
      receipt_time: sanitizeDate(data.receipt_time),
      po_date: sanitizeDate(data.po_date),
      invoice_date: sanitizeDate(data.invoice_date),
      lr_gr_date: sanitizeDate(data.lr_gr_date),
      tc_coa_date: sanitizeDate(data.tc_coa_date),
      qc_verified_datetime: sanitizeDate(data.qc_verified_datetime),
      qty_verified_datetime: sanitizeDate(data.qty_verified_datetime),
      recv_verified_datetime: sanitizeDate(data.recv_verified_datetime),
      auth_verified_datetime: sanitizeDate(data.auth_verified_datetime),
      materials: data.materials.map((m) => ({
        ...m,
        mfg_date: sanitizeDate(m.mfg_date),
      })),
    };

    if (isAdd) {
      await addEntry(sanitizedData, currentOrg?.id, currentUser?.id);
    } else {
      await updateEntry(entry.id, sanitizedData);
    }
    onBack();
  };

  return (
    <div className="animate-slide-up pb-10">
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden">
        <div className="sticky top-0 z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 flex items-center justify-center transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
              {isView ? (
                <Eye size={24} className="text-emerald-600" />
              ) : (
                <FileSpreadsheet size={24} className="text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {isView
                  ? "View GRN Entry"
                  : isAdd
                    ? "New GRN Entry"
                    : "Edit GRN Entry"}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {watch("grn_no") || "Fill the details below"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all"
            >
              <X size={16} /> Cancel
            </button>
            {!isView && (
              <button
                type="submit"
                form="grn-form"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
                style={{
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                }}
              >
                {isSubmitting ? (
                  <SlidersHorizontal size={16} className="spin" />
                ) : (
                  <Save size={16} />
                )}
                {isAdd ? "Save & Generate GRN" : "Save Changes"}
              </button>
            )}
          </div>
        </div>

        <form
          id="grn-form"
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 bg-slate-50/50"
        >
          <Section title="A. Receipt / Purchase Details" icon={ShoppingCart}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-5">
              <Controller
                control={control}
                name="grn_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field
                    label="GRN No."
                    required
                    error={errors.grn_no?.message}
                  >
                    <Input
                      value={value || ""}
                      disabled={isView}
                      readOnly={isAdd}
                      onChange={onChange}
                      ref={ref}
                      className={`${inputCls} ${isAdd ? "bg-slate-50 text-slate-500" : ""}`}
                      placeholder="Auto Generate"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="receipt_date"
                render={({ field }) => (
                  <Field label="Receipt Date">
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="Receipt Date"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="receipt_time"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Receipt Time">
                    <Input
                      type="time"
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="vehicle_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Vehicle No.">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="vendor_name"
                render={({ field }) => (
                  <Field
                    label="Vendor Name"
                    required
                    error={errors.vendor_name?.message}
                  >
                    {isView ? (
                      <Input
                        value={field.value || ""}
                        disabled
                        className={inputCls}
                      />
                    ) : (
                      <Select
                        value={field.value || null}
                        onChange={(val) => {
                          if (!val) return;
                          field.onChange(val);
                          // Auto-fill vendor code
                          const found = vendorOptions.find(
                            (v) => v.value === val,
                          );
                          setValue("vendor_code", found?.code || "", {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          // Auto-fill transporter from first matching PO for this vendor
                          const vendorPOs = purchaseOrders.filter(
                            (o) => o.vendorName === val,
                          );
                          const poWithTransport = vendorPOs.find(
                            (o) => o.transport,
                          );
                          setValue(
                            "transporter",
                            poWithTransport?.transport || "",
                            { shouldValidate: true, shouldDirty: true },
                          );
                          // Clear po_no when vendor changes
                          setValue("po_no", "", { shouldDirty: true });
                        }}
                        className="w-full"
                        aria-label="Vendor Name"
                      >
                        <Select.Trigger
                          className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}
                        >
                          <Select.Value placeholder="Select Vendor" />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {vendorOptions.map((opt) => (
                              <ListBox.Item
                                key={opt.value}
                                id={opt.value}
                                textValue={opt.label}
                              >
                                {opt.label}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="vendor_code"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Vendor Code">
                    <Input
                      value={value || ""}
                      disabled
                      readOnly
                      onChange={onChange}
                      ref={ref}
                      className={`${inputCls} bg-slate-50`}
                      placeholder="Auto Fetch"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="total_packages"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Total Packages">
                    <Input
                      type="number"
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="transporter"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Transporter">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Auto Fetch From PO"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="po_no"
                render={({ field }) => (
                  <Field label="PO No.">
                    {isView || poOptions.length === 0 ? (
                      <Input
                        value={field.value || ""}
                        disabled={isView}
                        onChange={field.onChange}
                        ref={field.ref}
                        className={inputCls}
                        placeholder={
                          poOptions.length === 0 ? "Select Vendor first" : ""
                        }
                      />
                    ) : (
                      <Select
                        value={field.value || null}
                        onChange={(val) => {
                          if (!val) return;
                          field.onChange(val);
                          // Auto-fill transporter from the selected PO
                          const matchedPO = purchaseOrders.find(
                            (o) =>
                              o.npplPoNo === val && o.vendorName === vendorName,
                          );
                          if (matchedPO?.transport) {
                            setValue("transporter", matchedPO.transport, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                        className="w-full"
                        aria-label="PO No."
                      >
                        <Select.Trigger
                          className={`${inputCls} px-4 py-3 h-[46px] flex items-center`}
                        >
                          <Select.Value placeholder="Select PO No." />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {poOptions.map((po) => (
                              <ListBox.Item key={po} id={po} textValue={po}>
                                {po}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="po_date"
                render={({ field }) => (
                  <Field label="PO Date">
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="PO Date"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="non_po_approval"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Non-PO Approval">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="lr_gr_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="LR / GR No.">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="lr_gr_date"
                render={({ field }) => (
                  <Field label="LR / GR Date">
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="LR / GR Date"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="invoice_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Invoice No.">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="invoice_date"
                render={({ field }) => (
                  <Field label="Invoice Date">
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="Invoice Date"
                    />
                  </Field>
                )}
              />
            </div>
          </Section>

          <Section
            title="B. Material Details"
            icon={PackageSearch}
            className="overflow-hidden"
          >
            <MaterialDetailsTable
              control={control}
              isView={isView}
              watch={watch}
              setValue={setValue}
              poItems={poItems}
            />
          </Section>

          <Section
            title="C. Documents, Packaging & Quality Check"
            icon={ClipboardCheck}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5">
              <Controller
                control={control}
                name="invoice_received"
                render={({ field }) => (
                  <Field label="Invoice Received">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={["Yes", "No", "N/A"]}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="challan_received"
                render={({ field }) => (
                  <Field label="Challan Received">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={["Yes", "No", "N/A"]}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="tc_coa_received"
                render={({ field }) => (
                  <Field label="TC / COA Received">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={["Yes", "No", "N/A"]}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="packaging_condition"
                render={({ field }) => (
                  <Field label="Packaging Condition">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={[
                        "Good",
                        "Damaged",
                        "Open/Torn",
                        "Wet",
                        "Contaminated",
                        "Other",
                      ]}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="tc_coa_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="TC / COA No.">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="tc_coa_date"
                render={({ field }) => (
                  <Field label="TC / COA Date">
                    <CustomDatePicker
                      field={field}
                      isView={isView}
                      label="TC / COA Date"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="qc_status"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="QC Status">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="final_qc_decision_by"
                render={({ field }) => (
                  <Field label="Final QC Decision By">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={employees
                        .map((emp) => emp.employeeName)
                        .filter(Boolean)}
                      placeholder="Select Employee"
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="discrepancy_type"
                render={({ field }) => (
                  <Field label="Discrepancy Type">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={[
                        "None",
                        "Short Quantity",
                        "Excess Quantity",
                        "Damaged Packages",
                        "Wrong Material/Grade",
                        "Batch Mismatch",
                        "Documents Missing",
                        "Other",
                      ]}
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="discrepancy_note_no"
                render={({ field: { onChange, value, ref } }) => (
                  <Field label="Discrepancy Note No.">
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual"
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="storage_location"
                render={({ field }) => (
                  <Field label="Storage Location">
                    <EditableCreatableSelect
                      value={field.value ?? ""}
                      options={storageLocationOptions}
                      onChange={field.onChange}
                      disabled={isView}
                      placeholder="Select or type..."
                    />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="quarantine_required"
                render={({ field }) => (
                  <Field label="Quarantine Required">
                    <CustomSelect
                      field={field}
                      isView={isView}
                      options={["Yes", "No"]}
                    />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="detailed_qc_remarks"
                render={({ field: { onChange, value, ref } }) => (
                  <Field
                    label="Detailed QC / Discrepancy Remarks"
                    colClass="col-span-1 md:col-span-3 xl:col-span-4"
                  >
                    <Input
                      value={value || ""}
                      disabled={isView}
                      onChange={onChange}
                      ref={ref}
                      className={inputCls}
                      placeholder="Manual Remarks"
                    />
                  </Field>
                )}
              />
            </div>
          </Section>

          <Section
            title="D. Verification & Approval"
            icon={ShieldCheck}
            className="overflow-hidden"
          >
            <VerificationTable
              control={control}
              isView={isView}
              employees={employees}
            />
          </Section>
        </form>
      </div>
    </div>
  );
}

export default function InwardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentOrg } = useAuthStore();
  const {
    entries,
    isLoading,
    fetchEntries,
    isModalOpen,
    modalMode,
    selectedEntry,
    setModalOpen,
    setModalMode,
    setSelectedEntry,
    isDeleteConfirmOpen,
    entryToDelete,
    setDeleteConfirmOpen,
    setEntryToDelete,
    deleteEntry,
  } = useInwardStore();

  useEffect(() => {
    if (currentOrg?.id) {
      fetchEntries(currentOrg.id);
    }
  }, [currentOrg]);

  const handleAdd = () => {
    setSelectedEntry(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await deleteEntry(entryToDelete.id);
      closeDeleteConfirm();
    }
  };

  const filteredEntries = entries.filter((e) => {
    const search = searchTerm.toLowerCase();
    const vendor = e.vendor_name || e.party_name || "";
    const desc = e.materials?.[0]?.description || e.description || "";
    return (
      (e.grn_no || "").toLowerCase().includes(search) ||
      vendor.toLowerCase().includes(search) ||
      desc.toLowerCase().includes(search)
    );
  });

  const totalQuantity = filteredEntries.reduce((sum, row) => {
    const qty = row.materials
      ? row.materials.reduce((acc, m) => acc + Number(m.received_qty || 0), 0)
      : Number(row.quantity || 0);
    return sum + qty;
  }, 0);

  const columns = [
    {
      header: "Date",
      accessor: "receipt_date",
      icon: CalendarIcon,
      width: "w-[100px]",
      render: (value, row) => (
        <span className="font-mono text-[12px] text-slate-500">
          {value || row.date}
        </span>
      ),
    },
    {
      header: "GRN NO",
      accessor: "grn_no",
      icon: Hash,
      width: "w-[110px]",
      render: (value) => (
        <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
          {value}
        </span>
      ),
    },
    {
      header: "Vendor Name",
      accessor: "vendor_name",
      icon: Building2,
      width: "w-[180px]",
      render: (value, row) => (
        <span
          className="font-bold text-slate-800 line-clamp-1"
          title={value || row.party_name}
        >
          {value || row.party_name}
        </span>
      ),
    },
    {
      header: "Material / Grade",
      accessor: "description",
      icon: PackageSearch,
      width: "w-[180px]",
      render: (_, row) => (
        <span className="font-semibold text-slate-700 uppercase tracking-tight line-clamp-1">
          {row.materials?.[0]?.description || row.description || "-"}
        </span>
      ),
    },
    {
      header: "Qty Received",
      accessor: "quantity",
      width: "w-[110px]",
      align: "right",
      render: (_, row) => {
        const qty = row.materials
          ? row.materials.reduce(
              (acc, m) => acc + Number(m.received_qty || 0),
              0,
            )
          : row.quantity;
        return (
          <span className="font-extrabold text-indigo-600">{qty || 0}</span>
        );
      },
    },
    {
      header: "Inv Date",
      accessor: "invoice_date",
      icon: CalendarIcon,
      width: "w-[100px]",
      render: (value) => (
        <span className="font-mono text-[12px] text-slate-500">
          {value || "-"}
        </span>
      ),
    },
    {
      header: "Invoice No",
      accessor: "invoice_no",
      icon: FileText,
      width: "w-[110px]",
      render: (value) =>
        value ? (
          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
            {value}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      header: "Transporter/LR",
      accessor: "transporter",
      icon: Truck,
      width: "w-[140px]",
      render: (value) => (
        <span className="font-medium text-slate-600 line-clamp-1">
          {value || "-"}
        </span>
      ),
    },
    {
      header: "QC Status",
      accessor: "qc_verified_status",
      width: "w-[110px]",
      align: "center",
      render: (value) =>
        value === "Approved" ? (
          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            APPROVED
          </span>
        ) : value === "Reject" ? (
          <span className="text-red-700 font-bold text-[10px] bg-red-50 px-2 py-1 rounded-md border border-red-200">
            REJECTED
          </span>
        ) : value === "Hold" ? (
          <span className="text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            HOLD
          </span>
        ) : (
          <span className="text-slate-400 font-bold text-[10px]">-</span>
        ),
    },
    {
      header: "PO.NO",
      accessor: "po_no",
      width: "w-[120px]",
      render: (value) =>
        value ? (
          <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">
            {value}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "w-[120px]",
      align: "center",
      render: (_, row) => (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleView(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (isModalOpen) {
    return (
      <InwardForm
        mode={modalMode}
        entry={selectedEntry}
        onBack={() => setModalOpen(false)}
      />
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto animate-slide-up py-8 px-4 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total GRNs Today"
          value={entries
            .filter(
              (e) =>
                e.receipt_date === todayIsoDate() || e.date === todayIsoDate(),
            )
            .length.toString()}
          icon={FileText}
          color="#6366f1"
          bg="rgba(99,102,241,0.12)"
          border="rgba(99,102,241,0.25)"
          animationDelay={0}
        />
        <StatsCard
          label="Total Qty Received"
          value={`${totalQuantity}`}
          icon={PackageSearch}
          color="#10b981"
          bg="rgba(16,185,129,0.12)"
          border="rgba(16,185,129,0.25)"
          animationDelay={50}
        />
        <StatsCard
          label="Pending QC"
          value={entries
            .filter((e) => e.qc_verified_status !== "Approved")
            .length.toString()}
          icon={ShieldCheck}
          color="#f59e0b"
          bg="rgba(245,158,11,0.12)"
          border="rgba(245,158,11,0.25)"
          animationDelay={100}
        />
        <StatsCard
          label="Active Transporters"
          value={new Set(
            entries.map((e) => e.transporter).filter(Boolean),
          ).size.toString()}
          icon={Truck}
          color="#8b5cf6"
          bg="rgba(139,92,246,0.12)"
          border="rgba(139,92,246,0.25)"
          animationDelay={150}
        />
      </div>

      <div className="flex flex-col gap-6">
        <TableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by GRN No, Vendor Name, Material..."
          theme="indigo"
          showFilter={true}
          addButtonText="New GRN"
          onAdd={handleAdd}
        />

        <DataTable
          columns={columns}
          data={filteredEntries}
          minWidth="1600px"
          isLoading={isLoading}
        />
        <TableFooter totalEntries={filteredEntries.length} />
      </div>

      {isDeleteConfirmOpen && entryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">
                Delete GRN Entry?
              </h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed">
                Are you sure you want to delete GRN{" "}
                <span className="font-bold text-slate-700">
                  {entryToDelete.grn_no}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Yes, Delete It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
