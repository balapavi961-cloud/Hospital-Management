import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Save, Trash2, PenTool, Eraser, Maximize2, Minimize2, Plus, Minus } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';

import html2canvas from 'html2canvas';

const HandwrittenPrescription = ({ isOpen, onClose, onSave, patient }) => {
    // Multi-page state
    const [pharmacyPages, setPharmacyPages] = useState([{ id: 1 }]);
    const [labPages, setLabPages] = useState([{ id: 1 }]);
    const [currentPharmacyPage, setCurrentPharmacyPage] = useState(0);
    const [currentLabPage, setCurrentLabPage] = useState(0);

    // Create refs for each page
    const pharmacyPadRefs = useRef([]);
    const labPadRefs = useRef([]);
    const prescriptionRef = useRef(null);

    const [penColor, setPenColor] = useState('black');
    const [isEraser, setIsEraser] = useState(false);
    const [penSize, setPenSize] = useState(2);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState('pharmacy'); // 'pharmacy' or 'laboratory'
    const [selectedTests, setSelectedTests] = useState({});
    const [savedTypes, setSavedTypes] = useState({ pharmacy: false, laboratory: false });
    const [sendingStatus, setSendingStatus] = useState({});
    const [savedPrescriptionIds, setSavedPrescriptionIds] = useState({});

    const LAB_TESTS = [
        'Blood Test',
        'Sugar Test',
        'MRI Scan',
        'CT Scan',
        'X-Ray',
        'Urine Test',
        'Lipid Profile',
        'Thyroid Profile',
        'Liver Function Test',
        'Kidney Function Test',
        'ECG',
        'Other'
    ];

    const toggleTest = (test) => {
        setSelectedTests(prev => ({
            ...prev,
            [test]: !prev[test]
        }));
    };

    // Page management functions
    const addPharmacyPage = () => {
        setPharmacyPages(prev => [...prev, { id: prev.length + 1 }]);
        setCurrentPharmacyPage(pharmacyPages.length);
    };

    const addLabPage = () => {
        setLabPages(prev => [...prev, { id: prev.length + 1 }]);
        setCurrentLabPage(labPages.length);
    };

    const removePharmacyPage = (index) => {
        if (pharmacyPages.length <= 1) return; // Keep at least one page
        setPharmacyPages(prev => prev.filter((_, i) => i !== index));
        if (currentPharmacyPage >= index && currentPharmacyPage > 0) {
            setCurrentPharmacyPage(currentPharmacyPage - 1);
        }
    };

    const removeLabPage = (index) => {
        if (labPages.length <= 1) return; // Keep at least one page
        setLabPages(prev => prev.filter((_, i) => i !== index));
        if (currentLabPage >= index && currentLabPage > 0) {
            setCurrentLabPage(currentLabPage - 1);
        }
    };

    // Debugging: Log patient data when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log("Prescription Model Open. Patient Data:", patient);
            // Reset state for new patient
            setSavedTypes({ pharmacy: false, laboratory: false });
            setSendingStatus({});
            setSavedPrescriptionIds({});
        }
    }, [isOpen, patient]);

    // Resize canvas when modal opens or full screen toggles or prescription type changes
    useEffect(() => {
        const resizeCanvas = () => {
            // Resize all Pharmacy Pads
            pharmacyPages.forEach((_, index) => {
                const ref = pharmacyPadRefs.current[index];
                if (ref && ref.getCanvas) {
                    const canvas = ref.getCanvas();
                    const parent = canvas.parentElement;
                    if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
                        const data = ref.toData();
                        canvas.width = parent.clientWidth;
                        canvas.height = parent.clientHeight;
                        ref.fromData(data);
                    }
                }
            });

            // Resize all Lab Pads
            labPages.forEach((_, index) => {
                const ref = labPadRefs.current[index];
                if (ref && ref.getCanvas) {
                    const canvas = ref.getCanvas();
                    const parent = canvas.parentElement;
                    if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
                        const data = ref.toData();
                        canvas.width = parent.clientWidth;
                        canvas.height = parent.clientHeight;
                        ref.fromData(data);
                    }
                }
            });
        };

        // Small delay to ensure DOM update has happened
        const timer = setTimeout(resizeCanvas, 50);
        window.addEventListener('resize', resizeCanvas);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [isFullScreen, isOpen, prescriptionType, pharmacyPages, labPages, currentPharmacyPage, currentLabPage]);

    if (!isOpen) return null;

    const clear = () => {
        if (prescriptionType === 'pharmacy') {
            const ref = pharmacyPadRefs.current[currentPharmacyPage];
            if (ref) ref.clear();
        } else {
            const ref = labPadRefs.current[currentLabPage];
            if (ref) ref.clear();
        }
    };

    const handleSavePharmacy = async () => {
        const images = {};

        // Helper to capture current view
        const captureCurrent = async () => {
            if (!prescriptionRef.current) return null;
            try {
                const canvas = await html2canvas(prescriptionRef.current, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                return canvas.toDataURL('image/png');
            } catch (err) {
                console.error("Capture failed:", err);
                return null;
            }
        };

        // Capture all Pharmacy Pages
        for (let i = 0; i < pharmacyPages.length; i++) {
            const ref = pharmacyPadRefs.current[i];
            if (ref && !ref.isEmpty()) {
                setCurrentPharmacyPage(i);
                await new Promise(resolve => setTimeout(resolve, 250));
                const dataURL = await captureCurrent();
                if (dataURL) {
                    const key = pharmacyPages.length > 1 ? `pharmacy-page${i + 1}` : 'pharmacy';
                    images[key] = dataURL;
                }
            }
        }

        if (Object.keys(images).length === 0) {
            alert("Please write a pharmacy prescription first.");
            return;
        }

        // Call parent's onSave which uploads to backend
        await onSave(images);

        // Mark pharmacy as saved
        setSavedTypes(prev => ({ ...prev, pharmacy: true }));
    };

    const handleSaveLab = async () => {
        const images = {};

        // Helper to capture current view
        const captureCurrent = async () => {
            if (!prescriptionRef.current) return null;
            try {
                const canvas = await html2canvas(prescriptionRef.current, {
                    useCORS: true,
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                return canvas.toDataURL('image/png');
            } catch (err) {
                console.error("Capture failed:", err);
                return null;
            }
        };

        // Capture all Lab Pages
        const hasSelectedTests = Object.values(selectedTests).some(val => val);
        for (let i = 0; i < labPages.length; i++) {
            const ref = labPadRefs.current[i];
            if (ref && (!ref.isEmpty() || (i === 0 && hasSelectedTests))) {
                setCurrentLabPage(i);
                await new Promise(resolve => setTimeout(resolve, 250));
                const dataURL = await captureCurrent();
                if (dataURL) {
                    const key = labPages.length > 1 ? `laboratory-page${i + 1}` : 'laboratory';
                    images[key] = dataURL;
                }
            }
        }

        if (Object.keys(images).length === 0) {
            alert("Please write a lab prescription first or select tests.");
            return;
        }

        // Call parent's onSave which uploads to backend
        await onSave(images);

        // Mark lab as saved
        setSavedTypes(prev => ({ ...prev, laboratory: true }));
    };

    const handleSendToPharmacy = async () => {
        setSendingStatus(prev => ({ ...prev, pharmacy: 'sending' }));
        try {
            // Get the pharmacy prescription ID
            const pharmacyId = savedPrescriptionIds.pharmacy || savedPrescriptionIds['pharmacy-page1'];
            if (pharmacyId) {
                await prescriptionService.sendToPharmacy(pharmacyId);
            }
            alert('Prescription sent to pharmacy successfully!');
            setSendingStatus(prev => ({ ...prev, pharmacy: 'sent' }));
        } catch (error) {
            console.error('Error sending to pharmacy:', error);
            alert('Failed to send prescription to pharmacy');
            setSendingStatus(prev => ({ ...prev, pharmacy: 'error' }));
        }
    };

    const handleSendToLab = async () => {
        setSendingStatus(prev => ({ ...prev, laboratory: 'sending' }));
        try {
            // Get the laboratory prescription ID
            const labId = savedPrescriptionIds.laboratory || savedPrescriptionIds['laboratory-page1'];
            if (labId) {
                await prescriptionService.sendToLab(labId);
            }
            alert('Prescription sent to lab successfully!');
            setSendingStatus(prev => ({ ...prev, laboratory: 'sent' }));
        } catch (error) {
            console.error('Error sending to lab:', error);
            alert('Failed to send prescription to lab');
            setSendingStatus(prev => ({ ...prev, laboratory: 'error' }));
        }
    };

    const toggleEraser = () => {
        setIsEraser(!isEraser);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullScreen ? 'bg-white' : 'bg-black/60 p-4'}`}>
            <div className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[95vh] rounded-none md:rounded-xl'}`}>

                {/* Top Control Bar - Tools for the Doctor (Not on the printed design ideally, but needed for UI) */}
                <div className="flex-none flex flex-wrap md:flex-nowrap items-center justify-between px-4 py-2 gap-2 bg-slate-100 border-b border-slate-300 select-none print:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-300">
                            <button
                                onClick={() => { setIsEraser(false); setPenColor('black'); }}
                                className={`p-1.5 rounded transition-colors ${!isEraser && penColor === 'black' ? 'bg-slate-200 ring-1 ring-slate-400' : 'hover:bg-slate-50'}`}
                                title="Black Pen"
                            >
                                <div className="w-4 h-4 rounded-full bg-black"></div>
                            </button>
                            <button
                                onClick={() => { setIsEraser(false); setPenColor('blue'); }}
                                className={`p-1.5 rounded transition-colors ${!isEraser && penColor === 'blue' ? 'bg-slate-200 ring-1 ring-slate-400' : 'hover:bg-slate-50'}`}
                                title="Blue Pen"
                            >
                                <div className="w-4 h-4 rounded-full bg-accent"></div>
                            </button>
                            <button
                                onClick={() => { setIsEraser(false); setPenColor('red'); }}
                                className={`p-1.5 rounded transition-colors ${!isEraser && penColor === 'red' ? 'bg-slate-200 ring-1 ring-slate-400' : 'hover:bg-slate-50'}`}
                                title="Red Pen"
                            >
                                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                            </button>
                        </div>
                        <div className="h-6 w-px bg-slate-300 mx-2"></div>
                        <button
                            onClick={toggleEraser}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isEraser ? 'bg-slate-300 text-slate-900' : 'text-slate-700 hover:bg-slate-200'}`}
                        >
                            <Eraser size={16} />
                            Eraser
                        </button>
                        <button
                            onClick={clear}
                            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="p-2 hover:bg-slate-200 rounded text-slate-600"
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-600 rounded text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Radio Buttons for Laboratory and Pharmacy - Outside of the saved image area */}
                <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 md:gap-6 select-none print:hidden">
                    <span className="text-sm font-medium text-slate-700">Prescription Type:</span>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                        <input
                            type="radio"
                            name="prescriptionType"
                            value="pharmacy"
                            checked={prescriptionType === 'pharmacy'}
                            onChange={() => setPrescriptionType('pharmacy')}
                            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                        />
                        <span className="font-medium text-sm text-slate-800">Pharmacy</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                        <input
                            type="radio"
                            name="prescriptionType"
                            value="laboratory"
                            checked={prescriptionType === 'laboratory'}
                            onChange={() => setPrescriptionType('laboratory')}
                            className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                        />
                        <span className="font-medium text-sm text-slate-800">Laboratory</span>
                    </label>
                </div>

                {/* Page Navigation Tabs */}
                <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto select-none print:hidden">
                    <span className="text-xs font-medium text-slate-600 mr-2">Pages:</span>
                    {prescriptionType === 'pharmacy' ? (
                        <>
                            {pharmacyPages.map((page, index) => (
                                <div key={page.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPharmacyPage(index)}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${currentPharmacyPage === index
                                            ? 'bg-accent text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                    {pharmacyPages.length > 1 && (
                                        <button
                                            onClick={() => removePharmacyPage(index)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Remove page"
                                        >
                                            <Minus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addPharmacyPage}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors"
                                title="Add new page"
                            >
                                <Plus size={16} />
                                Add Page
                            </button>
                        </>
                    ) : (
                        <>
                            {labPages.map((page, index) => (
                                <div key={page.id} className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentLabPage(index)}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${currentLabPage === index
                                            ? 'bg-accent text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                    {labPages.length > 1 && (
                                        <button
                                            onClick={() => removeLabPage(index)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Remove page"
                                        >
                                            <Minus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addLabPage}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors"
                                title="Add new page"
                            >
                                <Plus size={16} />
                                Add Page
                            </button>
                        </>
                    )}
                </div>

                {/* Prescription Pad Design Area */}
                <div ref={prescriptionRef} className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>

                    {/* Compact Header Section */}
                    <div className="px-6 pt-2 pb-1">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight font-sans" style={{ color: '#000000' }}>
                                    MedCare+plus
                                </h1>
                                <p className="text-xs font-normal opacity-80" style={{ color: '#000000' }}>
                                    street 1 , city , District , TamilNadu
                                </p>

                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex flex-col items-center justify-center scale-75 origin-top-right">
                                    <div className="mb-0 text-accent"> {/* Emerald Accent */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2L12 22" />
                                            <path d="M2 12L22 12" />
                                            <path d="M7 7L17 17M17 7L7 17" opacity="0.5" />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider text-accent">MCP+</span> {/* Emerald */}
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full border-b-[1.5px] border-dotted my-1 opacity-40" style={{ borderColor: '#000000' }}></div>

                        {/* Compact Patient Details Grid - 3 Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs font-medium font-sans" style={{ color: '#000000' }}>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>Patient Name:</span>
                                <span className="font-semibold" style={{ color: '#000000' }}>{patient?.patient_name || patient?.name || 'Patient'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>Age / Gender:</span>
                                <span className="font-semibold">{patient?.age || '--'} / {patient?.gender || '--'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>Date:</span>
                                <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>BP:</span>
                                <span className="font-semibold">{patient?.blood_pressure || '--'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>Heart Rate:</span>
                                <span className="font-semibold">{patient?.heart_rate || '--'} bpm</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-20 font-normal" style={{ color: '#4b5563' }}>Temp:</span>
                                <span className="font-semibold">{patient?.temperature || '--'}</span>
                            </div>
                        </div>

                        {/* Solid Line */}
                        <div className="w-full border-b mt-2 mb-0" style={{ borderColor: '#000000' }}></div>
                    </div>

                    {/* Canvas / Writing Area */}
                    <div className="flex-1 relative w-full cursor-crosshair" style={{ backgroundColor: '#ffffff' }}>
                        {/* Pharmacy Pages */}
                        {prescriptionType === 'pharmacy' && pharmacyPages.map((page, index) => (
                            <div
                                key={page.id}
                                style={{
                                    display: currentPharmacyPage === index ? 'block' : 'none',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                            >
                                <SignatureCanvas
                                    ref={el => pharmacyPadRefs.current[index] = el}
                                    penColor={isEraser ? 'white' : penColor}
                                    minWidth={isEraser ? 20 : 1}
                                    maxWidth={isEraser ? 20 : 2.5}
                                    canvasProps={{
                                        className: 'w-full h-full block'
                                    }}
                                    backgroundColor="#ffffff"
                                />
                                {/* Doctor's Signature Footer ON the paper */}
                                <div className="absolute bottom-4 right-8 z-10 pointer-events-none select-none flex flex-col items-center gap-1">
                                    <p className="text-xl font-normal font-sans" style={{ color: '#000000' }}>Doctor's Signature</p>
                                </div>
                            </div>
                        ))}

                        {/* Laboratory Pages */}
                        {prescriptionType === 'laboratory' && labPages.map((page, index) => (
                            <div
                                key={page.id}
                                style={{
                                    display: currentLabPage === index ? 'flex' : 'none',
                                    flexDirection: 'column',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                                className="flex-col"
                            >
                                {/* Lab Tests Grid - Only on first page */}
                                {index === 0 && (
                                    <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        {LAB_TESTS.map((test) => (
                                            <label key={test} className="flex items-center gap-2 cursor-pointer p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedTests[test]}
                                                    onChange={() => toggleTest(test)}
                                                    style={{ accentColor: '#10b981', border: '1px solid #cbd5e1' }}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{test}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Header for Doctor's Writing */}
                                <div className="px-6 py-1" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                        {index === 0 ? 'Additional Notes / Doctor\'s Writing' : `Page ${index + 1} Notes`}
                                    </span>
                                </div>

                                <div className="flex-1 relative">
                                    <SignatureCanvas
                                        ref={el => labPadRefs.current[index] = el}
                                        penColor={isEraser ? 'white' : penColor}
                                        minWidth={isEraser ? 20 : 1}
                                        maxWidth={isEraser ? 20 : 2.5}
                                        canvasProps={{
                                            className: 'w-full h-full block'
                                        }}
                                        backgroundColor="#ffffff"
                                    />
                                </div>
                                {/* Doctor's Signature Footer ON the paper */}
                                <div className="absolute bottom-4 right-8 z-10 pointer-events-none select-none flex flex-col items-center gap-1">
                                    <p className="text-xl font-normal font-sans" style={{ color: '#000000' }}>Doctor's Signature</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Controls - Distinct from paper */}
                <div className="flex-none p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 z-10 print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>

                    {prescriptionType === 'pharmacy' && !savedTypes.pharmacy && (
                        <button
                            onClick={handleSavePharmacy}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-gradient hover:opacity-90 text-white rounded text-sm font-semibold shadow-sm transition-all"
                        >
                            <Save size={18} />
                            Save Pharmacy Prescription
                        </button>
                    )}

                    {prescriptionType === 'laboratory' && !savedTypes.laboratory && (
                        <button
                            onClick={handleSaveLab}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-gradient hover:opacity-90 text-white rounded text-sm font-semibold shadow-sm transition-all"
                        >
                            <Save size={18} />
                            Save Lab Prescription
                        </button>
                    )}

                    {savedTypes[prescriptionType] && (
                        <>
                            {prescriptionType === 'pharmacy' && (
                                <button
                                    onClick={handleSendToPharmacy}
                                    disabled={sendingStatus.pharmacy === 'sending' || sendingStatus.pharmacy === 'sent'}
                                    className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-semibold shadow-sm transition-all ${sendingStatus.pharmacy === 'sent'
                                        ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                        : sendingStatus.pharmacy === 'sending'
                                            ? 'bg-slate-300 text-slate-600 cursor-wait'
                                            : 'bg-accent hover:opacity-90 text-white shadow-lg shadow-accent/20'
                                        }`}
                                >
                                    {sendingStatus.pharmacy === 'sent' ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Sent to Pharmacy
                                        </>
                                    ) : sendingStatus.pharmacy === 'sending' ? (
                                        'Sending...'
                                    ) : (
                                        'Send to Pharmacy'
                                    )}
                                </button>
                            )}
                            {prescriptionType === 'laboratory' && (
                                <button
                                    onClick={handleSendToLab}
                                    disabled={sendingStatus.laboratory === 'sending' || sendingStatus.laboratory === 'sent'}
                                    className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-semibold shadow-sm transition-all ${sendingStatus.laboratory === 'sent'
                                        ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                        : sendingStatus.laboratory === 'sending'
                                            ? 'bg-slate-300 text-slate-600 cursor-wait'
                                            : 'bg-accent hover:opacity-90 text-white shadow-lg shadow-accent/20'
                                        }`}
                                >
                                    {sendingStatus.laboratory === 'sent' ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Sent to Lab
                                        </>
                                    ) : sendingStatus.laboratory === 'sending' ? (
                                        'Sending...'
                                    ) : (
                                        'Send to Lab'
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div >
    );
};

export default HandwrittenPrescription;


