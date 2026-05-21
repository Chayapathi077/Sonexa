import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useParams,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import {
  getReport,
  saveReport,
  FetalReport,
  getTemplates,
  saveTemplate,
  ReportTemplate,
} from "../lib/db";
import { ArrowLeft, Save, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const initialFormData = {
  // General
  patientName: "",
  ageGender: "",
  patientId: "",
  visitNo: "",
  referredBy: "",
  visitDate: new Date().toISOString().split("T")[0],
  lmpDate: "",
  lmpEdd: "",

  // Survey
  presentation: "",
  placenta: "",
  liquor: "",
  singleDeepestPocket: "",
  amnioticFluidIndex: "",
  umbilicalCord: "",
  fetalActivity: "",
  cardiacActivity: "",
  fetalHeartRate: "",
  cervix: "",

  // Biometry
  bpd: "",
  bpdGest: "",
  bpdPerc: "",
  hc: "",
  hcGest: "",
  hcPerc: "",
  ac: "",
  acGest: "",
  acPerc: "",
  fl: "",
  flGest: "",
  flPerc: "",
  efw: "",
  efwPerc: "",

  // Long bones
  tibia: "",
  tibiaGest: "",
  tibiaPerc: "",
  fibula: "",
  fibulaGest: "",
  fibulaPerc: "",
  humerus: "",
  humerusGest: "",
  humerusPerc: "",
  radius: "",
  radiusGest: "",
  radiusPerc: "",
  ulna: "",
  ulnaGest: "",
  ulnaPerc: "",
  footLength: "",
  tcd: "",

  // Aneuploidy Markers
  nasalBone: "",
  nuchalFold: "",

  // Fetal Anatomy - Head
  headText: "",
  neckText: "",
  spineText: "",
  faceText: "",
  thoraxText: "",
  heartText: "",
  abdomenText: "",
  kubText: "",
  extremitiesText: "",

  // Doppler
  mcaPi: "",
  mcaPiPerc: "",
  uaPi: "",
  uaPiPerc: "",
  cpRatio: "",
  cpRatioPerc: "",

  // Impression
  impressionHeading: "",
  impressionBody: "",
  impressionEcho: "",

  // Aneuploidy Risk Assesment
  aneuploidyRisk: "",
  counsellingNotes: "",
  doctorName: "",
  doctorQual: "",
  kmcRegNo: "",
};

const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-white/90 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium"
      style={type === "date" ? { colorScheme: "dark" } : {}}
    />
  </div>
);

const Textarea = ({ label, value, onChange, rows = 3 }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-white/90 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="appearance-none block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl shadow-inner text-white focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium"
    />
  </div>
);

const calculateBiometryInfo = (type: string, val: string, formData: any) => {
  const num = parseFloat(val);
  if (isNaN(num)) return null;

  let weeks = 0;
  if (type === "bpd")
    weeks = 9.54 + 1.482 * (num / 10) + 0.1676 * Math.pow(num / 10, 2);
  else if (type === "hc")
    weeks = 8.96 + 0.54 * (num / 10) + 0.0003 * Math.pow(num / 10, 3);
  else if (type === "ac")
    weeks = 8.14 + 0.753 * (num / 10) + 0.0036 * Math.pow(num / 10, 2);
  else if (type === "fl")
    weeks = 10.35 + 2.46 * (num / 10) + 0.17 * Math.pow(num / 10, 2);
  else if (type === "tibia") weeks = 0.598 * num;
  else if (type === "fibula") weeks = 0.588 * num;
  else if (type === "humerus") weeks = 0.576 * num;
  else if (type === "radius") weeks = 0.669 * num;
  else if (type === "ulna") weeks = 0.588 * num;
  else if (type === "efw") {
    weeks = 2.1 * Math.pow(num, 1 / 3) + 6.0;
  }

  let perc = "";
  if (formData?.lmpDate && formData?.visitDate) {
    const lmp = new Date(formData.lmpDate).getTime();
    const visit = new Date(formData.visitDate).getTime();
    if (lmp && visit && visit > lmp) {
      const agreed = (visit - lmp) / (1000 * 60 * 60 * 24 * 7);

      let z = 0;
      let calculatedZ = false;

      if (agreed > 0 && weeks > 0) {
        // Approximate standard deviation is ~8% of the agreed age
        const sd = agreed * 0.08;
        z = (weeks - agreed) / sd;
        calculatedZ = true;
      } else if ((agreed > 0 && type.includes("Pi")) || type === "cpRatio") {
        // Approximate Doppler percentiles
        // MCA PI mean decreases from ~2.0 (20w) to ~1.4 (40w) -> ~ -0.03 per week
        // UA PI mean decreases from ~1.3 (20w) to ~0.8 (40w) -> ~ -0.025 per week
        // CPR mean is around 1.5-2.0
        if (type === "mcaPi") {
          const mean = 2.0 - 0.03 * (agreed - 20);
          const sd = 0.3;
          z = (num - mean) / sd;
          calculatedZ = true;
        } else if (type === "uaPi") {
          const mean = 1.3 - 0.025 * (agreed - 20);
          const sd = 0.2;
          z = (num - mean) / sd;
          calculatedZ = true;
        } else if (type === "cpRatio") {
          const mean = 1.8;
          const sd = 0.4;
          z = (num - mean) / sd;
          calculatedZ = true;
        }
      }

      if (calculatedZ) {
        let p = Math.round((1 / (1 + Math.exp(-1.702 * z))) * 100);
        p = Math.max(1, Math.min(99, p));
        perc = p < 5 ? `<5%ile` : `${p}%ile`;
      }
    }
  }

  if (type.includes("Pi") || type === "cpRatio") {
    return { gest: undefined, perc: perc || "50%ile" };
  }

  if (type === "efw") {
    return { gest: undefined, perc: perc || "50%ile" };
  }

  let w = Math.max(0, Math.floor(weeks));
  let d = Math.round(Math.max(0, (weeks - w) * 7));
  if (d === 7) {
    w += 1;
    d = 0;
  }
  return { gest: `${w}W${d > 0 ? ` ${d}D` : ""}`, perc: perc || "50%ile" };
};

const TemplatedTextarea = ({
  label,
  value,
  onChange,
  rows = 3,
  categoryKey,
  templates,
  onSaveTemplate,
}: any) => {
  const categoryTemplates = templates.filter(
    (t: any) => t.category === categoryKey,
  );

  return (
    <div className="mb-6 p-6 bg-white/5 rounded-[1.5rem] border border-white/10 shadow-sm backdrop-blur-sm">
      <div className="flex justify-between items-center mb-5">
        <label className="block text-lg font-bold text-white drop-shadow-sm">
          {label} Templates
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {categoryTemplates.map((t: any) => {
          const isSelected = value.trim() === t.content.trim();
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.content)}
              className={`text-left p-5 rounded-[1.25rem] transition-all flex flex-col h-full min-h-[140px] backdrop-blur-md ${isSelected ? "border-2 border-fuchsia-400 bg-white/20 shadow-lg scale-[1.02]" : "border border-white/20 bg-white/10 shadow-sm hover:bg-white/20 hover:border-white/40"}`}
            >
              <div className="flex justify-between items-start w-full mb-3 pb-3 border-b border-white/10">
                <span
                  className={`font-bold text-sm ${isSelected ? "text-white" : "text-white/90"} pr-2 drop-shadow-sm`}
                >
                  {t.name}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-fuchsia-400 bg-fuchsia-500" : "border-white/40"}`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-white/80 line-clamp-6 leading-relaxed whitespace-pre-wrap flex-grow font-medium">
                {t.content}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onSaveTemplate(categoryKey, value)}
          className="text-center p-5 rounded-[1.25rem] border-2 border-dashed border-white/30 bg-white/5 hover:border-white/60 hover:bg-white/10 transition-all flex flex-col items-center justify-center min-h-[140px] shadow-sm group backdrop-blur-md"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-6 h-6 text-white/70 group-hover:text-white" />
          </div>
          <span className="font-bold text-sm text-white/90 group-hover:text-white drop-shadow-sm">
            Save as Template
          </span>
          <span className="text-xs text-white/50 group-hover:text-white/80 mt-1.5">
            From text below
          </span>
        </button>
      </div>

      <div className="relative mt-2">
        <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-3">
          Editable Content
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="appearance-none block w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.25rem] shadow-inner text-white placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-all sm:text-sm font-medium leading-relaxed"
          placeholder="Select a template above or type a new report content here..."
        />
      </div>
    </div>
  );
};

export default function ReportEditor() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get("cloneId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [activeTab, setActiveTab] = useState("Patient Info");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const TABS = [
    "Patient Info",
    "Fetus Survey",
    "Biometry & Bones",
    "Anatomy & Doppler",
    "Impression & Doctor",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls = Array.from(files).map((file: File) =>
        URL.createObjectURL(file),
      );
      setImageUrls((prev) => [...prev, ...urls]);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      getTemplates(user.uid).then((data) => setTemplates(data));
    }
  }, [user]);

  useEffect(() => {
    const fetchExisting = async () => {
      if (!user?.uid) return;
      if (id) {
        // Editing existing report
        const report = await getReport(id, user.uid);
        if (report) setFormData(JSON.parse(report.details));
      } else if (cloneId) {
        // Cloning existing report to use as template
        const report = await getReport(cloneId, user.uid);
        if (report) {
          const clonedData = JSON.parse(report.details);
          // Clear patient specific data but retain report settings
          clonedData.patientName = "";
          clonedData.patientId = "";
          clonedData.visitDate = new Date().toISOString().split("T")[0];
          clonedData.lmpDate = "";
          clonedData.lmpEdd = "";
          setFormData(clonedData);
        }
      }
    };
    fetchExisting();
  }, [id, cloneId, user]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => {
      let updated = { ...prev, [key]: value };

      const biometryFields = [
        "bpd",
        "hc",
        "ac",
        "fl",
        "efw",
        "tibia",
        "fibula",
        "humerus",
        "radius",
        "ulna",
        "mcaPi",
        "uaPi",
        "cpRatio",
      ];

      // If we change lmpDate or visitDate, recalculate ALL fields
      if (key === "lmpDate" || key === "visitDate" || key === "lmpEdd") {
        biometryFields.forEach((fieldKey) => {
          if (updated[fieldKey]) {
            const info = calculateBiometryInfo(
              fieldKey,
              updated[fieldKey],
              updated,
            );
            if (info) {
              if (info.gest !== undefined)
                updated[`${fieldKey}Gest`] = info.gest;
              if (info.perc !== undefined)
                updated[`${fieldKey}Perc`] = info.perc;
            }
          }
        });
      } else if (biometryFields.includes(key) && value) {
        const info = calculateBiometryInfo(key, value, updated);
        if (info) {
          if (info.gest !== undefined) updated[`${key}Gest`] = info.gest;
          if (info.perc !== undefined) updated[`${key}Perc`] = info.perc;
        }
      } else if (biometryFields.includes(key) && !value) {
        updated[`${key}Gest`] = "";
        updated[`${key}Perc`] = "";
      }

      return updated;
    });
  };

  const handleSaveSnippet = async (categoryKey: string, content: string) => {
    if (!content.trim()) {
      alert(
        "Please enter some text in the text area first to save it as a snippet.",
      );
      return;
    }
    const name = window.prompt(
      "Enter a short name for this snippet (e.g. 'Normal Head View'):",
    );
    if (!name?.trim() || !user?.uid) return;

    const template: ReportTemplate = {
      id: crypto.randomUUID(),
      userId: user.uid,
      category: categoryKey,
      name: name.trim(),
      content: content.trim(),
      createdAt: Date.now(),
    };
    await saveTemplate(template);
    const updated = await getTemplates(user.uid);
    setTemplates(updated);
  };

  const handleSave = async () => {
    if (!user?.uid) {
      alert("You must be logged in to save reports.");
      return;
    }
    const reportId = id || crypto.randomUUID();
    const now = Date.now();
    const isNew = !id;

    const report: FetalReport = {
      id: reportId,
      userId: user.uid,
      createdAt: now, // Simplification for now
      updatedAt: now,
      patientName: formData.patientName || "Unnamed Patient",
      patientId: formData.patientId || "",
      age: formData.ageGender || "",
      gender: (formData.ageGender || "").includes("Female") ? "Female" : "Male",
      referredBy: formData.referredBy || "",
      visitNo: formData.visitNo || "",
      visitDate: formData.visitDate || "",
      lmpDate: formData.lmpDate || "",
      lmpEdd: formData.lmpEdd || "",
      details: JSON.stringify(formData),
    };

    try {
      await saveReport(report);
      navigate("/");
    } catch (e: any) {
      console.error(e);
      alert("Failed to save report: " + e.message);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed text-white font-sans pb-20 ${isImageFullscreen ? "overflow-hidden h-screen" : ""}`}
    >
      <header
        className={`sticky top-0 pt-4 ${isImageFullscreen ? "z-0 opacity-0 pointer-events-none" : "z-50 opacity-100 transition-opacity"}`}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center justify-center w-10 h-10 text-white/70 hover:text-white transition-all bg-white/20 border border-white/30 hover:bg-white/30 rounded-2xl backdrop-blur-md shadow-lg hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 drop-shadow-md" />
              </Link>
              <h1 className="text-xl font-bold tracking-wide drop-shadow-md">
                {id ? "Edit Report" : "New Report"}
              </h1>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-[1.25rem] shadow-sm font-bold transition-all active:scale-[0.98] backdrop-blur-md hover:scale-105"
            >
              <Save className="w-4 h-4 text-white drop-shadow-md" />
              Save Report
            </button>
          </div>
        </div>
      </header>

      <main
        className={`max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 ${imageUrls.length > 0 ? "flex-col xl:flex-row" : "flex-col"} ${isImageFullscreen ? "relative z-[100]" : "relative z-10"}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  activeTab === tab
                    ? "bg-white text-fuchsia-600 scale-[1.02]"
                    : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto w-full sm:w-auto mt-2 sm:mt-0">
              <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl shadow-sm font-bold transition-all cursor-pointer backdrop-blur-md">
                Upload Reference
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 p-6 sm:p-8">
            {activeTab === "Patient Info" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Patient Name"
                  value={formData.patientName}
                  onChange={(v: string) => handleChange("patientName", v)}
                />
                <Input
                  label="Patient ID"
                  value={formData.patientId}
                  onChange={(v: string) => handleChange("patientId", v)}
                />
                <Input
                  label="Age / Sex"
                  value={formData.ageGender}
                  onChange={(v: string) => handleChange("ageGender", v)}
                />
                <Input
                  label="Visit No"
                  value={formData.visitNo}
                  onChange={(v: string) => handleChange("visitNo", v)}
                />
                <Input
                  label="Referred By"
                  value={formData.referredBy}
                  onChange={(v: string) => handleChange("referredBy", v)}
                />
                <Input
                  label="Visit Date"
                  type="date"
                  value={formData.visitDate}
                  onChange={(v: string) => handleChange("visitDate", v)}
                />
                <Input
                  label="LMP Date"
                  type="date"
                  value={formData.lmpDate}
                  onChange={(v: string) => handleChange("lmpDate", v)}
                />
                <Input
                  label="LMP EDD"
                  type="date"
                  value={formData.lmpEdd}
                  onChange={(v: string) => handleChange("lmpEdd", v)}
                />
              </div>
            )}

            {activeTab === "Fetus Survey" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Presentation"
                    value={formData.presentation}
                    onChange={(v: string) => handleChange("presentation", v)}
                  />
                  <Input
                    label="Placenta"
                    value={formData.placenta}
                    onChange={(v: string) => handleChange("placenta", v)}
                  />
                  <Input
                    label="Liquor"
                    value={formData.liquor}
                    onChange={(v: string) => handleChange("liquor", v)}
                  />
                  <Input
                    label="Single deepest pocket"
                    value={formData.singleDeepestPocket}
                    onChange={(v: string) =>
                      handleChange("singleDeepestPocket", v)
                    }
                  />
                  <Input
                    label="Amniotic fluid index"
                    value={formData.amnioticFluidIndex}
                    onChange={(v: string) =>
                      handleChange("amnioticFluidIndex", v)
                    }
                  />
                  <Input
                    label="Umbilical cord"
                    value={formData.umbilicalCord}
                    onChange={(v: string) => handleChange("umbilicalCord", v)}
                  />
                  <Input
                    label="Fetal activity"
                    value={formData.fetalActivity}
                    onChange={(v: string) => handleChange("fetalActivity", v)}
                  />
                  <Input
                    label="Cardiac activity"
                    value={formData.cardiacActivity}
                    onChange={(v: string) => handleChange("cardiacActivity", v)}
                  />
                  <Input
                    label="Fetal heart rate"
                    value={formData.fetalHeartRate}
                    onChange={(v: string) => handleChange("fetalHeartRate", v)}
                  />
                </div>
                <div className="mt-6">
                  <TemplatedTextarea
                    label="Maternal / Cervix"
                    categoryKey="cervix"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.cervix}
                    onChange={(v: string) => handleChange("cervix", v)}
                  />
                </div>
              </div>
            )}

            {activeTab === "Biometry & Bones" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Biometry
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="BPD"
                      value={formData.bpd}
                      onChange={(v: string) => handleChange("bpd", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.bpdGest}
                      onChange={(v: string) => handleChange("bpdGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.bpdPerc}
                      onChange={(v: string) => handleChange("bpdPerc", v)}
                    />

                    <Input
                      label="HC"
                      value={formData.hc}
                      onChange={(v: string) => handleChange("hc", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.hcGest}
                      onChange={(v: string) => handleChange("hcGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.hcPerc}
                      onChange={(v: string) => handleChange("hcPerc", v)}
                    />

                    <Input
                      label="AC"
                      value={formData.ac}
                      onChange={(v: string) => handleChange("ac", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.acGest}
                      onChange={(v: string) => handleChange("acGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.acPerc}
                      onChange={(v: string) => handleChange("acPerc", v)}
                    />

                    <Input
                      label="FL-Rt"
                      value={formData.fl}
                      onChange={(v: string) => handleChange("fl", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.flGest}
                      onChange={(v: string) => handleChange("flGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.flPerc}
                      onChange={(v: string) => handleChange("flPerc", v)}
                    />

                    <div className="col-span-3 grid grid-cols-2 gap-3 mt-2">
                      <Input
                        label="EFW"
                        value={formData.efw}
                        onChange={(v: string) => handleChange("efw", v)}
                      />
                      <Input
                        label="EFW %ile"
                        value={formData.efwPerc}
                        onChange={(v: string) => handleChange("efwPerc", v)}
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-white/10" />

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Long Bones & Markers
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Tibia"
                      value={formData.tibia}
                      onChange={(v: string) => handleChange("tibia", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.tibiaGest}
                      onChange={(v: string) => handleChange("tibiaGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.tibiaPerc}
                      onChange={(v: string) => handleChange("tibiaPerc", v)}
                    />

                    <Input
                      label="Fibula"
                      value={formData.fibula}
                      onChange={(v: string) => handleChange("fibula", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.fibulaGest}
                      onChange={(v: string) => handleChange("fibulaGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.fibulaPerc}
                      onChange={(v: string) => handleChange("fibulaPerc", v)}
                    />

                    <Input
                      label="Humerus"
                      value={formData.humerus}
                      onChange={(v: string) => handleChange("humerus", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.humerusGest}
                      onChange={(v: string) => handleChange("humerusGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.humerusPerc}
                      onChange={(v: string) => handleChange("humerusPerc", v)}
                    />

                    <Input
                      label="Radius"
                      value={formData.radius}
                      onChange={(v: string) => handleChange("radius", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.radiusGest}
                      onChange={(v: string) => handleChange("radiusGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.radiusPerc}
                      onChange={(v: string) => handleChange("radiusPerc", v)}
                    />

                    <Input
                      label="Ulna"
                      value={formData.ulna}
                      onChange={(v: string) => handleChange("ulna", v)}
                    />
                    <Input
                      label="Gest"
                      value={formData.ulnaGest}
                      onChange={(v: string) => handleChange("ulnaGest", v)}
                    />
                    <Input
                      label="%ile"
                      value={formData.ulnaPerc}
                      onChange={(v: string) => handleChange("ulnaPerc", v)}
                    />

                    <div className="col-span-3 grid grid-cols-2 gap-4 mt-2">
                      <Input
                        label="Foot Length"
                        value={formData.footLength}
                        onChange={(v: string) => handleChange("footLength", v)}
                      />
                      <Input
                        label="TCD"
                        value={formData.tcd}
                        onChange={(v: string) => handleChange("tcd", v)}
                      />
                      <Input
                        label="Nasal Bone"
                        value={formData.nasalBone}
                        onChange={(v: string) => handleChange("nasalBone", v)}
                      />
                      <Input
                        label="Nuchal Fold"
                        value={formData.nuchalFold}
                        onChange={(v: string) => handleChange("nuchalFold", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Anatomy & Doppler" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Fetal Anatomy
                  </h3>
                  <TemplatedTextarea
                    label="Head"
                    rows={6}
                    categoryKey="headText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.headText}
                    onChange={(v: string) => handleChange("headText", v)}
                  />
                  <TemplatedTextarea
                    label="Neck"
                    categoryKey="neckText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.neckText}
                    onChange={(v: string) => handleChange("neckText", v)}
                  />
                  <TemplatedTextarea
                    label="Spine"
                    rows={6}
                    categoryKey="spineText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.spineText}
                    onChange={(v: string) => handleChange("spineText", v)}
                  />
                  <TemplatedTextarea
                    label="Face"
                    rows={5}
                    categoryKey="faceText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.faceText}
                    onChange={(v: string) => handleChange("faceText", v)}
                  />
                  <TemplatedTextarea
                    label="Thorax"
                    categoryKey="thoraxText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.thoraxText}
                    onChange={(v: string) => handleChange("thoraxText", v)}
                  />
                  <TemplatedTextarea
                    label="Heart"
                    rows={12}
                    categoryKey="heartText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.heartText}
                    onChange={(v: string) => handleChange("heartText", v)}
                  />
                  <TemplatedTextarea
                    label="Abdomen"
                    rows={6}
                    categoryKey="abdomenText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.abdomenText}
                    onChange={(v: string) => handleChange("abdomenText", v)}
                  />
                  <TemplatedTextarea
                    label="KUB"
                    categoryKey="kubText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.kubText}
                    onChange={(v: string) => handleChange("kubText", v)}
                  />
                  <TemplatedTextarea
                    label="Extremities"
                    rows={6}
                    categoryKey="extremitiesText"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.extremitiesText}
                    onChange={(v: string) => handleChange("extremitiesText", v)}
                  />
                </div>

                <hr className="border-white/10" />

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Doppler</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Middle Cerebral Artery PI"
                      value={formData.mcaPi}
                      onChange={(v: string) => handleChange("mcaPi", v)}
                    />
                    <Input
                      label="MCE PI %"
                      value={formData.mcaPiPerc}
                      onChange={(v: string) => handleChange("mcaPiPerc", v)}
                    />
                    <Input
                      label="Umbilical Artery PI"
                      value={formData.uaPi}
                      onChange={(v: string) => handleChange("uaPi", v)}
                    />
                    <Input
                      label="Umbillical %"
                      value={formData.uaPiPerc}
                      onChange={(v: string) => handleChange("uaPiPerc", v)}
                    />
                    <Input
                      label="Cerebroplacental Ratio"
                      value={formData.cpRatio}
                      onChange={(v: string) => handleChange("cpRatio", v)}
                    />
                    <Input
                      label="CPR %"
                      value={formData.cpRatioPerc}
                      onChange={(v: string) => handleChange("cpRatioPerc", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Impression & Doctor" && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Impression & Risk Assessment
                  </h3>
                  <Input
                    label="Impression Heading"
                    value={formData.impressionHeading}
                    onChange={(v: string) =>
                      handleChange("impressionHeading", v)
                    }
                  />
                  <TemplatedTextarea
                    label="Impression Body"
                    rows={6}
                    categoryKey="impressionBody"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.impressionBody}
                    onChange={(v: string) => handleChange("impressionBody", v)}
                  />
                  <TemplatedTextarea
                    label="Impression Echo"
                    rows={4}
                    categoryKey="impressionEcho"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.impressionEcho}
                    onChange={(v: string) => handleChange("impressionEcho", v)}
                  />
                  <TemplatedTextarea
                    label="Aneuploidy Risk Assessment"
                    rows={8}
                    categoryKey="aneuploidyRisk"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.aneuploidyRisk}
                    onChange={(v: string) => handleChange("aneuploidyRisk", v)}
                  />
                  <TemplatedTextarea
                    label="Counselling Notes"
                    rows={8}
                    categoryKey="counsellingNotes"
                    templates={templates}
                    onSaveTemplate={handleSaveSnippet}
                    value={formData.counsellingNotes}
                    onChange={(v: string) =>
                      handleChange("counsellingNotes", v)
                    }
                  />
                </div>

                <hr className="border-white/10" />

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Doctor Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mb-4">
                    <Input
                      label="Doctor Name"
                      value={formData.doctorName}
                      onChange={(v: string) => handleChange("doctorName", v)}
                    />
                    <Input
                      label="KMC Reg No"
                      value={formData.kmcRegNo}
                      onChange={(v: string) => handleChange("kmcRegNo", v)}
                    />
                  </div>
                  <Textarea
                    label="Qualifications"
                    rows={3}
                    value={formData.doctorQual}
                    onChange={(v: string) => handleChange("doctorQual", v)}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/20">
              <button
                onClick={() => {
                  const currentIndex = TABS.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1]);
                }}
                disabled={activeTab === TABS[0]}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const currentIndex = TABS.indexOf(activeTab);
                  if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1]);
                }}
                disabled={activeTab === TABS[TABS.length - 1]}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-purple-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {imageUrls.length > 0 && (
          <div
            className={`shrink-0 ${isImageFullscreen ? "fixed inset-0 z-[100] bg-black/90 p-4 sm:p-8 flex items-center justify-center backdrop-blur-sm" : "w-full xl:w-[550px] sticky top-[100px] self-start bg-white/10 backdrop-blur-xl rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/20 p-4 overflow-hidden"}`}
          >
            <div
              className={`flex justify-between items-center mb-3 ${isImageFullscreen ? "absolute top-6 right-6 z-10 gap-4" : ""}`}
            >
              {!isImageFullscreen && (
                <h3 className="text-sm font-bold text-white">
                  Reference Images ({currentImageIndex + 1}/{imageUrls.length})
                </h3>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsImageFullscreen(!isImageFullscreen)}
                  className="text-white hover:bg-white/20 text-xs px-3 py-1.5 bg-white/10 rounded-lg transition-colors border border-white/20 shadow-sm font-bold backdrop-blur-md"
                >
                  {isImageFullscreen ? "Close Fullscreen" : "Fullscreen"}
                </button>
                <button
                  onClick={() => {
                    setImageUrls([]);
                    setCurrentImageIndex(0);
                    setIsImageFullscreen(false);
                  }}
                  className="text-red-300 hover:text-white text-xs px-3 py-1.5 hover:bg-red-500/80 bg-white/10 rounded-lg transition-colors border border-white/20 shadow-sm font-bold backdrop-blur-md"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="relative group flex items-center justify-center">
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? imageUrls.length - 1 : prev - 1,
                    );
                  }}
                  className={`absolute left-2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors ${isImageFullscreen ? "p-4 left-4" : ""}`}
                >
                  <ChevronLeft
                    className={isImageFullscreen ? "w-8 h-8" : "w-5 h-5"}
                  />
                </button>
              )}
              <img
                src={imageUrls[currentImageIndex]}
                alt={`Reference ${currentImageIndex + 1}`}
                className={`${isImageFullscreen ? "max-w-full max-h-[90vh] rounded-lg object-contain cursor-zoom-out" : "w-full rounded-xl object-contain border border-white/10 bg-black/20 max-h-[70vh] cursor-zoom-in"}`}
                onClick={() => setIsImageFullscreen(!isImageFullscreen)}
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) =>
                      prev === imageUrls.length - 1 ? 0 : prev + 1,
                    );
                  }}
                  className={`absolute right-2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors ${isImageFullscreen ? "p-4 right-4" : ""}`}
                >
                  <ChevronRight
                    className={isImageFullscreen ? "w-8 h-8" : "w-5 h-5"}
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
