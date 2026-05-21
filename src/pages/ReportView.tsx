import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { getReport } from "../lib/db";
import { ArrowLeft, Printer } from "lucide-react";

const nl2br = (str: string) => {
  if (!str) return null;
  return str.split("\n").map((item, key) => {
    return (
      <React.Fragment key={key}>
        {item}
        <br />
      </React.Fragment>
    );
  });
};

const parsePerc = (percStr: string | undefined) => {
  if (!percStr) return null;
  const match = percStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
};

const BiometryGraph = ({
  title,
  value,
  gest,
  perc,
  isLast,
}: {
  title: string;
  value: string;
  gest?: string;
  perc?: string;
  isLast?: boolean;
}) => {
  const p = parsePerc(perc);
  const isLow = p !== null && p <= 5;
  const isHigh = p !== null && p >= 95;
  const isMuchLess =
    perc?.includes("<") ||
    perc?.includes("lt") ||
    title === "AC" ||
    title === "EFW BPD,HC,AC,FL" ||
    title === "FL-Rt" ||
    (p !== null && p < 5);
  const isMuchMore = perc?.includes(">") || perc?.includes("gt");

  return (
    <th
      className={`py-[6px] ${!isLast ? "border-r border-black" : ""} w-[20%] font-bold text-xs align-top`}
    >
      <div className="">
        {title} {value}
      </div>
      {gest && <div className="">{gest}</div>}
      <div className="">({perc || ""})</div>
      <div className="relative mt-[22px] mb-5 px-4 text-center">
        <div className="w-full relative border-t-[1px] border-black font-bold">
          {isLow && (
            <div className="absolute bottom-[2px] left-0 -translate-x-1/2 font-bold text-sm tracking-tighter">
              {isMuchLess ? "<<" : "*"}
            </div>
          )}
          {isHigh && (
            <div className="absolute bottom-[2px] right-0 translate-x-1/2 font-bold text-sm tracking-tighter">
              {isMuchMore ? ">>" : "*"}
            </div>
          )}

          <div className="absolute -top-[3px] left-0 h-[6px] border-l-[1px] border-black"></div>
          <div className="absolute -top-[2px] left-[22.22%] h-[4px] border-l-[1px] border-black"></div>
          <div className="absolute -top-[3px] left-1/2 h-[6px] border-l-[1px] border-black"></div>
          <div className="absolute -top-[2px] left-[77.78%] h-[4px] border-l-[1px] border-black"></div>
          <div className="absolute -top-[3px] right-0 h-[6px] border-l-[1px] border-black -ml-[1px]"></div>

          <span className="absolute top-[4px] left-0 -translate-x-1/2 text-[10px] font-bold">
            5%
          </span>
          <span className="absolute top-[4px] left-1/2 -translate-x-1/2 text-[10px] font-bold">
            50%
          </span>
          <span className="absolute top-[4px] right-0 translate-x-1/2 text-[10px] font-bold">
            95%
          </span>

          {p !== null && !isLow && !isHigh && (
            <div
              className="absolute bottom-[2px] -translate-x-1/2 font-bold text-sm tracking-tighter"
              style={{ left: `${(p - 5) * (100 / 90)}%` }}
            >
              *
            </div>
          )}
        </div>
      </div>
    </th>
  );
};

const DopplerGraph = ({
  name,
  value,
  perc,
}: {
  name: string;
  value: string;
  perc?: string;
}) => {
  const p = parsePerc(perc);
  return (
    <div className="grid grid-cols-[200px_100px_150px] gap-2 mb-2 items-center text-[15px]">
      <div>{name}</div>
      <div>{value}</div>
      <div className="flex items-center gap-2">
        <div className="w-[84px] relative border-t border-black mx-1 mt-3">
          <div className="absolute -top-[5px] left-0 h-2.5 border-l border-black"></div>
          <div className="absolute -top-[5px] left-1/2 h-2.5 border-l border-black"></div>
          <div className="absolute -top-[5px] right-0 h-2.5 border-l border-black"></div>

          <span className="absolute top-[3px] left-0 -translate-x-1/2 text-[9px]">
            0
          </span>
          <span className="absolute top-[3px] left-1/2 -translate-x-1/2 text-[9px]">
            50
          </span>
          <span className="absolute top-[3px] right-0 translate-x-1/2 text-[9px]">
            100
          </span>

          {p !== null && (
            <div
              className="absolute top-1/2 -translate-y-[calc(50%+6px)] w-3 h-3 flex items-center justify-center z-10"
              style={{ left: `calc(${Math.max(0, Math.min(100, p))}% - 6px)` }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="black" />
              </svg>
            </div>
          )}
        </div>
        <span className="text-[15px]">({perc || ""})</span>
      </div>
    </div>
  );
};

const LongBoneGraph = ({
  name,
  value,
  gest,
  perc,
}: {
  name: string;
  value: string;
  gest?: string;
  perc?: string;
}) => {
  const p = parsePerc(perc);
  return (
    <div className="grid grid-cols-[100px_160px_150px] gap-2 mb-2 items-center text-[15px]">
      <div>{name}</div>
      <div>
        {value}
        {value && gest ? `, ${gest}` : value ? "" : gest || ""}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-[84px] relative border-t border-black mx-1 mt-3">
          <div className="absolute -top-[5px] left-0 h-2.5 border-l border-black"></div>
          <div className="absolute -top-[5px] left-1/2 h-2.5 border-l border-black"></div>
          <div className="absolute -top-[5px] right-0 h-2.5 border-l border-black"></div>

          <span className="absolute top-[3px] left-0 -translate-x-1/2 text-[9px]">
            0
          </span>
          <span className="absolute top-[3px] left-1/2 -translate-x-1/2 text-[9px]">
            50
          </span>
          <span className="absolute top-[3px] right-0 translate-x-1/2 text-[9px]">
            100
          </span>

          {p !== null && (
            <div
              className="absolute top-1/2 -translate-y-[calc(50%+6px)] w-3 h-3 flex items-center justify-center z-10"
              style={{ left: `calc(${Math.max(0, Math.min(100, p))}% - 6px)` }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="black" />
              </svg>
            </div>
          )}
        </div>
        <span className="text-[15px]">({perc || ""})</span>
      </div>
    </div>
  );
};

const PageHeader = ({ data }: { data: any }) => (
  <div className="text-gray-700 border-b border-gray-300 pb-1 mb-3 text-[15px] pt-2 print:pt-0">
    {data.patientName} / {data.patientId} / {data.visitDate} / Visit No{" "}
    {data.visitNo}
  </div>
);

import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';

export default function ReportView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (id && user?.uid) {
      getReport(id, user.uid).then((report) => {
        if (report) {
          setData(JSON.parse(report.details));
        }
      });
    }
  }, [id, user]);

  const handleDownloadPDF = async () => {
    const container = document.getElementById('report-pages-container');
    if (!container) return;

    setIsGeneratingPDF(true);
    try {
      const originalZoom = container.style.zoom;
      container.style.zoom = '1';
      
      const pages = Array.from(container.children) as HTMLElement[];
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        const rect = page.getBoundingClientRect();
        
        const imgData = await domtoimage.toJpeg(page, { 
          quality: 0.95, 
          bgcolor: '#ffffff',
          width: rect.width || 794,
          height: rect.height || 1123,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = ((rect.height || 1123) * pdfWidth) / (rect.width || 794);
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Sonexa_Report_${data.patientName?.replace(/ /g, '_') || 'Export'}.pdf`);
      container.style.zoom = originalZoom;
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!data)
    return (
      <div className="min-h-screen p-8 text-center bg-gray-50 flex items-center justify-center">
        Loading Report...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed font-sans text-gray-900 pb-20 print:bg-white print:p-0 print:pb-0">
      {/* Screen only headers */}
      <div className="print:hidden fixed top-0 w-full z-50 pt-4 pointer-events-none">
        <div className="max-w-[1650px] mx-auto px-4 xl:px-4">
          <div className="flex justify-between items-center h-[72px] pointer-events-auto">
            <Link
              to="/"
              className="flex items-center justify-center w-[52px] h-[52px] text-white hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] hover:scale-105 group relative overflow-hidden"
              title="Back to Dashboard"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[150%] -skew-x-[30deg] group-hover:translate-x-[150%] transition-transform duration-700"></div>
              <ArrowLeft className="w-6 h-6 drop-shadow-md group-hover:-translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-3 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.15)] backdrop-blur-xl font-bold transition-all duration-300 active:scale-[0.98] hover:scale-105 relative overflow-hidden group disabled:opacity-75 disabled:cursor-wait"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[150%] -skew-x-[30deg] group-hover:translate-x-[150%] transition-transform duration-700"></div>
              <Printer className={`w-5 h-5 text-white drop-shadow-sm transition-transform flex-shrink-0 ${isGeneratingPDF ? 'animate-pulse' : 'group-hover:scale-110'}`} />
              <span className="drop-shadow-sm tracking-wide whitespace-nowrap">{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div id="report-pages-container" className="max-w-[1700px] mx-auto pt-[104px] pb-12 print:pt-0 print:pb-0 print:max-w-none print:block print:w-full grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 justify-items-center relative z-10 px-4 xl:px-6" style={{ zoom: 0.9 }}>
        {/* PAGE 1 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-after-page print:scale-100 border border-white/20 print:border-none">
          <table className="w-full text-[15px] border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-[2px] font-bold w-[18%]">
                  Patient name
                </td>
                <td className="border border-black px-2 py-[2px] w-[50%]">
                  {data.patientName}
                </td>
                <td className="border border-black px-2 py-[2px] font-bold w-[12%]">
                  Age/Sex
                </td>
                <td className="border border-black px-2 py-[2px]">
                  {data.ageGender}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-[2px] font-bold">
                  Patient Id
                </td>
                <td className="border border-black px-2 py-[2px]">
                  {data.patientId}
                </td>
                <td className="border border-black px-2 py-[2px] font-bold">
                  Visit no
                </td>
                <td className="border border-black px-2 py-[2px]">
                  {data.visitNo}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-[2px] font-bold">
                  Referred by
                </td>
                <td className="border border-black px-2 py-[2px]">
                  {data.referredBy}
                </td>
                <td className="border border-black px-2 py-[2px] font-bold">
                  Visit date
                </td>
                <td className="border border-black px-2 py-[2px]">
                  {data.visitDate}
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-[2px] font-bold">
                  LMP date
                </td>
                <td className="border border-black px-2 py-[2px]" colSpan={3}>
                  {data.lmpDate}
                  {data.lmpEdd && `, LMP EDD: ${data.lmpEdd}`}
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-[20px] font-bold text-center text-blue-800 mb-4 leading-tight tracking-[0.01em]">
            Targeted Imaging For Fetal Anomalies(TIFFA) with Real time Fetal
            Echo-cardiography
          </h2>

          <p className="mb-4">
            Real time B-mode ultrasonography of gravid uterus done.
            <br />
            Route: Transabdominal
            <br />
            <strong>Single intrauterine gestation</strong>
          </p>

          <h3 className="font-bold text-gray-900 mt-4 mb-1">Maternal</h3>
          <p className="mb-4">{nl2br(data.cervix)}</p>

          <h3 className="font-bold text-gray-900 mt-4 mb-1">Fetus</h3>
          <h4 className="font-bold text-blue-800 mt-1 mb-1">Survey</h4>
          <p className="mb-4">
            Presentation - {data.presentation}
            <br />
            Placenta - {data.placenta}
            <br />
            Liquor - {data.liquor}
            <br />
            Single deepest pocket = {data.singleDeepestPocket}
            <br />
            Amniotic fluid index = {data.amnioticFluidIndex}
            <br />
            Umbilical cord - {data.umbilicalCord}
            <br />
            Fetal activity {data.fetalActivity}
            <br />
            Cardiac activity {data.cardiacActivity}
            <br />
            Fetal heart rate - {data.fetalHeartRate}
          </p>

          <h4 className="font-bold text-blue-800 text-lg mt-6 mb-[2px]">
            Biometry(Hadlock,Mediscan)
          </h4>
          <table
            className="w-full text-xs text-center border-collapse border border-gray-800 mb-4 font-bold text-black bg-white"
            cellPadding={0}
            cellSpacing={0}
          >
            <thead>
              <tr>
                <BiometryGraph
                  title="BPD"
                  value={data.bpd ? `${data.bpd} mm` : ""}
                  gest={data.bpdGest}
                  perc={data.bpdPerc}
                />
                <BiometryGraph
                  title="HC"
                  value={data.hc ? `${data.hc} mm` : ""}
                  gest={data.hcGest}
                  perc={data.hcPerc}
                />
                <BiometryGraph
                  title="AC"
                  value={data.ac ? `${data.ac} mm` : ""}
                  gest={data.acGest}
                  perc={data.acPerc}
                />
                <BiometryGraph
                  title="FL-Rt"
                  value={data.fl ? `${data.fl} mm` : ""}
                  gest={data.flGest}
                  perc={data.flPerc}
                />
                <BiometryGraph
                  title="EFW BPD,HC,AC,FL"
                  value={data.efw ? `${data.efw} \ngrams` : ""}
                  perc={data.efwPerc}
                  isLast={true}
                />
              </tr>
            </thead>
          </table>

          <div className="mt-4 text-sm">
            <div className="grid grid-cols-[100px_160px_150px] gap-2 mb-1 text-[15px] items-end">
              <div className="text-[20px] font-medium mt-1">Long bones</div>
              <div className="font-[400] pb-1">Right (mm)</div>
              <div></div>
            </div>
            <LongBoneGraph
              name="Tibia"
              value={data.tibia}
              gest={data.tibiaGest}
              perc={data.tibiaPerc}
            />
            <LongBoneGraph
              name="Fibula"
              value={data.fibula}
              gest={data.fibulaGest}
              perc={data.fibulaPerc}
            />
            <LongBoneGraph
              name="Humerus"
              value={data.humerus}
              gest={data.humerusGest}
              perc={data.humerusPerc}
            />
            <LongBoneGraph
              name="Radius"
              value={data.radius}
              gest={data.radiusGest}
              perc={data.radiusPerc}
            />
            <LongBoneGraph
              name="Ulna"
              value={data.ulna}
              gest={data.ulnaGest}
              perc={data.ulnaPerc}
            />
            <div className="mt-3 text-[15px]">
              Foot Length : {data.footLength ? `${data.footLength} mm` : ""}
            </div>
            <div className="text-[15px]">
              TCD : {data.tcd ? `${data.tcd} mm` : ""}
            </div>
          </div>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 1</div>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-before-page print:scale-100 border border-white/20 print:border-none">
          <PageHeader data={data} />

          <h4 className="font-bold text-blue-800 mt-2 mb-1">
            Aneuploidy Markers
          </h4>
          <p className="mb-4">
            Nasal Bone : {data.nasalBone}
            <br />
            Nuchal Fold : {data.nuchalFold}
          </p>

          <h4 className="font-bold text-blue-800 mt-4 mb-2">Fetal Anatomy</h4>

          <h5 className="font-bold text-blue-700 mt-2">Head</h5>
          <p className="mb-4">{nl2br(data.headText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">Neck</h5>
          <p className="mb-4">{nl2br(data.neckText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">Spine</h5>
          <p className="mb-4">{nl2br(data.spineText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">Face</h5>
          <p className="mb-4">{nl2br(data.faceText)}</p>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 2</div>
          </div>
        </div>

        {/* PAGE 3 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-before-page print:scale-100 border border-white/20 print:border-none">
          <PageHeader data={data} />

          <h5 className="font-bold text-blue-700 mt-2">Thorax</h5>
          <p className="mb-4">{nl2br(data.thoraxText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">Heart</h5>
          <h4 className="font-bold italic text-lg mb-2">
            Real time Fetal Echo-cardiography
          </h4>
          <p className="mb-4">{nl2br(data.heartText)}</p>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 3</div>
          </div>
        </div>

        {/* PAGE 4 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-before-page print:scale-100 border border-white/20 print:border-none">
          <PageHeader data={data} />

          <h5 className="font-bold text-blue-700 mt-2">Abdomen</h5>
          <p className="mb-4">{nl2br(data.abdomenText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">KUB</h5>
          <p className="mb-4">{nl2br(data.kubText)}</p>

          <h5 className="font-bold text-blue-700 mt-2">Extremities</h5>
          <p className="mb-4">{nl2br(data.extremitiesText)}</p>

          <h4 className="font-bold mt-4 mb-2">Fetal doppler</h4>
          <DopplerGraph
            name="Middle Cerebral Artery PI"
            value={data.mcaPi}
            perc={data.mcaPiPerc}
          />

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 4</div>
          </div>
        </div>

        {/* PAGE 5 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-before-page print:scale-100 border border-white/20 print:border-none">
          <PageHeader data={data} />

          <h4 className="font-bold mb-2">Fetal doppler (continued)</h4>
          <DopplerGraph
            name="Umbilical Artery PI"
            value={data.uaPi}
            perc={data.uaPiPerc}
          />
          <DopplerGraph
            name="Cerebroplacental ratio"
            value={data.cpRatio}
            perc={data.cpRatioPerc}
          />

          <h2 className="text-xl font-bold text-blue-800 text-center mb-4 underline">
            Impression
          </h2>
          <h3 className="text-lg font-bold text-red-600 mb-2">
            {data.impressionHeading}
          </h3>

          <p className="font-bold mb-4">{nl2br(data.impressionBody)}</p>

          <div className="font-bold text-blue-700 mt-6 pt-4 border-t border-dashed border-gray-300">
            Anatomical survey revealed:{" "}
            {data.impressionHeading.replace(/[^a-zA-Z ]/g, "").trim()}
          </div>
          <p className="font-bold mb-6 pl-4 mt-2 whitespace-pre-wrap">
            {data.impressionEcho}
          </p>

          <h4 className="font-bold text-blue-700 italic text-lg uppercase mb-2">
            Aneuploidy Risk Assessment
          </h4>
          <p className="mb-4 italic">{nl2br(data.aneuploidyRisk)}</p>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 5</div>
          </div>
        </div>

        {/* PAGE 6 */}
        <div className="bg-white/95 backdrop-blur-md shadow-2xl print:bg-white print:shadow-none p-10 print:p-0 rounded-xl print:rounded-none min-h-[1056px] w-[800px] max-w-[100vw] sm:max-w-full origin-top scale-90 sm:scale-100 xl:scale-95 2xl:scale-100 relative text-[15px] leading-relaxed break-inside-avoid print:break-before-page print:scale-100 border border-white/20 print:border-none">
          <PageHeader data={data} />

          <p className="italic text-sm text-gray-700 mb-6">
            Couple understands that this is risk assessment only. A high risk
            does not always indicate that the fetus has Down's syndrome, and a
            low or intermediate risk does not rule out the possibility of the
            condition. Risk assessment merely acts as a guide to offer invasive
            testing. Chromosomal abnormalities cannot be detected by ultrasound
            scan or blood test on their own.
          </p>

          <h4 className="font-bold text-blue-700 text-lg mb-2">
            **COUNSELLING NOTES:
          </h4>
          <p className="mb-8 font-bold text-[16px] leading-[1.8]">
            {nl2br(data.counsellingNotes)}
          </p>

          <h4 className="font-medium italic text-blue-500 text-lg mb-2">
            Please note:
          </h4>
          <p className="text-[13px] text-gray-700 leading-tight mb-6">
            Ultrasound scanning cannot detect all fetal abnormalities and
            genetic syndromes. Even though this scan has been performed as per
            current international guidelines and protocols for fetal imaging,
            certain abnormalities may go undetected due to several reasons such
            as maternal body habitus, unfavorable fetal position or abnormal
            amount of amniotic fluid. Assessment of small body parts like
            fingers, toes and ears does not come within the scope of the
            targeted anomaly scan. Certain fetal parts are not amenable for
            prenatal evaluation such as inner ear, retina, Gastrointestinal
            parts etc. Subtle anomalies like mild facial dysmorphism, clefts of
            the posterior palate may not be evident until after birth. ASD, Tiny
            VSD and PDA are not antenatal diagnosis. Certain lesions like
            Congenital diaphragmatic hernia, valvular lesions, tumors,
            arrhythmias and co-arctation of aorta can manifest in advanced
            pregnancy. Some abnormalities may evolve as the gestation advances
            and obviously those cannot be detected at the current gestation. On
            patient’s discretions follow up scans, every 4 weeks can be done to
            rule out late manifesting conditions especially fetal cardiac
            conditions. Genetic syndromes cannot be ruled out by ultrasound
            examination alone.
          </p>

          <p className="mb-8 text-sm">
            <span className="font-bold">
              {data.doctorName.replace("DR.", "I, Dr.")}
            </span>
            , declare that while conducting ultrasonography/ image scanning on
            this above mentioned patient,{" "}
            <strong>
              I have neither detected nor disclosed the sex of the fetus to
              anybody in any manner.
            </strong>
          </p>

          <div className="font-bold text-blue-600 text-lg mb-8">
            Best wishes.
          </div>

          <div className="font-bold text-xl italic mt-16">
            {data.doctorName}
          </div>
          <div className="font-bold italic whitespace-pre-wrap leading-tight mt-1">
            {data.doctorQual}
          </div>
          <div className="font-bold mt-4">KMC Reg No: {data.kmcRegNo}</div>

          <div className="absolute bottom-6 left-8 right-8 flex justify-between text-xs text-gray-500">
            <div>
              Printed on:{" "}
              {new Date().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            <div>Page 6</div>
          </div>
        </div>
      </div>
    </div>
  );
}
