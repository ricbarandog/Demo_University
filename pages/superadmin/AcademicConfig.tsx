import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Modal } from '../../components/Card';
import { Course, Subject } from '../../types';
import { Settings, Plus, Trash, BookOpen, Users, Edit, Save, X, ChevronDown, ChevronRight, DollarSign } from 'lucide-react';

export const AcademicConfig = () => {
    const { courses, staffUsers, config, updateSystemConfig, addCourse, updateCourse } = useApp();
    
    // System Config State
    const [sysConfig, setSysConfig] = useState(config);
    const [newDept, setNewDept] = useState('');

    // Curriculum Management State
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [isCurriculumModalOpen, setCurriculumModalOpen] = useState(false);
    
    // Edit Course State
    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
    const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

    // Subject State (for the course being edited)
    const [tempSubject, setTempSubject] = useState<Partial<Subject>>({ code: '', name: '', units: 3, yearLevel: 1, semester: 1 });

    const handleConfigSave = async () => {
        await updateSystemConfig(sysConfig);
        alert("System Configuration Updated");
    };

    const handleAddDept = () => {
        if(newDept && !sysConfig.departments.includes(newDept)) {
            const updatedDepts = [...sysConfig.departments, newDept];
            setSysConfig({...sysConfig, departments: updatedDepts});
            setNewDept('');
            updateSystemConfig({...sysConfig, departments: updatedDepts});
        }
    };

    const handleDeleteDept = (dept: string) => {
        if(window.confirm(`Are you sure you want to delete ${dept}?`)) {
            const updatedDepts = sysConfig.departments.filter(d => d !== dept);
            setSysConfig({...sysConfig, departments: updatedDepts});
            updateSystemConfig({...sysConfig, departments: updatedDepts});
        }
    };

    const getDeptTeacherStatus = (dept: string) => {
        const teachers = staffUsers.filter(u => u.role === 'teacher' && u.department === dept);
        return teachers.length > 0 ? `${teachers.length} Teacher(s)` : 'Unassigned';
    };

    // --- CURRICULUM HANDLERS ---

    const openCurriculum = (dept: string) => {
        setSelectedDept(dept);
        setCurriculumModalOpen(true);
    };

    const handleAddCourse = () => {
        setEditingCourse({
            id: '',
            name: '',
            type: 'college',
            department: selectedDept!,
            subjects: [],
            tuitionPerUnit: 0,
            miscFee: 0,
            adviser: ''
        });
        setIsEditCourseOpen(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse({...course});
        setIsEditCourseOpen(true);
    };

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse || !editingCourse.id || !editingCourse.name) return;

        const courseData = editingCourse as Course;
        
        // Check if updating or adding
        const existing = courses.find(c => c.id === courseData.id);
        if (existing) {
            await updateCourse(courseData.id, courseData);
        } else {
            await addCourse(courseData);
        }
        setIsEditCourseOpen(false);
        setEditingCourse(null);
    };

    const handleAddSubject = () => {
        if (!editingCourse || !tempSubject.code || !tempSubject.name) return;
        const newSubjects = [...(editingCourse.subjects || []), tempSubject as Subject];
        setEditingCourse({ ...editingCourse, subjects: newSubjects });
        setTempSubject({ code: '', name: '', units: 3, yearLevel: 1, semester: 1 });
    };

    const removeSubject = (code: string) => {
        if (!editingCourse) return;
        const newSubjects = editingCourse.subjects?.filter(s => s.code !== code) || [];
        setEditingCourse({ ...editingCourse, subjects: newSubjects });
    };

    const deptCourses = courses.filter(c => c.department === selectedDept);

    return (
        <div className="space-y-6">
            <Card title="System Settings" action={<Settings className="text-gray-400" />}>
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Academic Year & Term</h4>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1">Year</label>
                            <input className="w-full p-2 border rounded" value={sysConfig.academicYear} onChange={e=>setSysConfig({...sysConfig, academicYear: e.target.value})} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1">Semester</label>
                            <input className="w-full p-2 border rounded" value={sysConfig.semester} onChange={e=>setSysConfig({...sysConfig, semester: e.target.value})} />
                        </div>
                        <div className="flex items-end">
                             <button onClick={handleConfigSave} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm h-[42px]">Save Config</button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Course & Curriculum Management" action={<BookOpen className="text-gray-400" />}>
                <div className="space-y-6">
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                <Users size={18} className="text-indigo-600"/> Departments
                            </h4>
                            <div className="flex gap-2">
                                <input 
                                    className="p-2 border rounded text-sm w-64" 
                                    placeholder="New Department Name" 
                                    value={newDept}
                                    onChange={e=>setNewDept(e.target.value)}
                                />
                                <button onClick={handleAddDept} className="px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-1 text-sm">
                                    <Plus size={16}/> Add
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto border rounded-lg bg-white">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3">Department Name</th>
                                        <th className="p-3">Staffing Status</th>
                                        <th className="p-3">Programs</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sysConfig.departments.length > 0 ? sysConfig.departments.map(dept => {
                                        const status = getDeptTeacherStatus(dept);
                                        const programCount = courses.filter(c => c.department === dept).length;
                                        return (
                                            <tr key={dept} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{dept}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        status === 'Unassigned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-600">{programCount} Course(s)</td>
                                                <td className="p-3 text-right flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openCurriculum(dept)}
                                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium hover:bg-indigo-100 flex items-center gap-1"
                                                    >
                                                        <BookOpen size={14}/> Manage Curriculum
                                                    </button>
                                                    <button onClick={() => handleDeleteDept(dept)} className="text-red-500 hover:text-red-700 p-1">
                                                        <Trash size={14}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={4} className="p-4 text-center text-gray-500">No departments configured.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Modal 1: List Courses for Selected Department */}
            <Modal isOpen={isCurriculumModalOpen} onClose={() => setCurriculumModalOpen(false)} title={`Curriculum: ${selectedDept}`}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Manage courses, subjects, and fees for <span className="font-bold">{selectedDept}</span>.</p>
                        <button onClick={handleAddCourse} className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                            <Plus size={16}/> Add Program
                        </button>
                    </div>

                    <div className="space-y-3">
                        {deptCourses.map(course => (
                            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-lg">{course.id}</h5>
                                        <p className="text-sm text-gray-600">{course.name}</p>
                                    </div>
                                    <button onClick={() => handleEditCourse(course)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                                        <Edit size={14}/> Edit / View
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                                    <div className="flex items-center gap-1"><BookOpen size={14}/> {course.subjects.length} Subjects</div>
                                    <div className="flex items-center gap-1"><DollarSign size={14}/> Tuition: {course.tuitionPerUnit}/unit</div>
                                    <div className="flex items-center gap-1"><Users size={14}/> Type: {course.type}</div>
                                    <div className="flex items-center gap-1"><DollarSign size={14}/> Misc: {course.miscFee}</div>
                                </div>
                            </div>
                        ))}
                        {deptCourses.length === 0 && (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                                No courses or programs found for this department.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal 2: Edit/Add Course Detail */}
            <Modal isOpen={isEditCourseOpen} onClose={() => setIsEditCourseOpen(false)} title={editingCourse?.id ? `Edit Course: ${editingCourse.name}` : "New Course / Program"}>
                {editingCourse && (
                    <form onSubmit={handleSaveCourse} className="space-y-6">
                        {/* Course Info */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Program Details & Fees</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Program ID / Code</label>
                                    <input required className="w-full p-2 border rounded text-sm" placeholder="e.g. BSCS"
                                        value={editingCourse.id} onChange={e=>setEditingCourse({...editingCourse, id: e.target.value})} 
                                        disabled={!!courses.find(c => c.id === editingCourse.id && c.id !== '')} // Disable ID edit if exists
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Student Type</label>
                                    <select className="w-full p-2 border rounded text-sm"
                                        value={editingCourse.type} onChange={e=>setEditingCourse({...editingCourse, type: e.target.value as any})}>
                                            <option value="college">College</option>
                                            <option value="highschool">High School</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Program Name</label>
                                <input required className="w-full p-2 border rounded text-sm" placeholder="e.g. Bachelor of Science in Computer Science"
                                    value={editingCourse.name} onChange={e=>setEditingCourse({...editingCourse, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1">Tuition per Unit (₱)</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" placeholder="0"
                                        value={editingCourse.tuitionPerUnit} onChange={e=>setEditingCourse({...editingCourse, tuitionPerUnit: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">Misc Fee (₱)</label>
                                    <input type="number" className="w-full p-2 border rounded text-sm" placeholder="0"
                                        value={editingCourse.miscFee} onChange={e=>setEditingCourse({...editingCourse, miscFee: parseFloat(e.target.value)})} />
                                </div>
                            </div>
                        </div>

                        {/* Subjects Management */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide flex justify-between items-center">
                                <span>Subject Curriculum</span>
                                <span className="text-xs normal-case bg-gray-200 px-2 py-1 rounded text-gray-600">{editingCourse.subjects?.length || 0} Subjects</span>
                            </h4>
                            
                            <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-white">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-100 font-semibold text-gray-600">
                                        <tr>
                                            <th className="p-2">Code</th>
                                            <th className="p-2">Name</th>
                                            <th className="p-2 w-16 text-center">Units</th>
                                            <th className="p-2 w-16">Yr/Sem</th>
                                            <th className="p-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editingCourse.subjects?.map((subj, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-2 font-medium">{subj.code}</td>
                                                <td className="p-2 text-gray-600 truncate max-w-[120px]" title={subj.name}>{subj.name}</td>
                                                <td className="p-2 text-center">{subj.units}</td>
                                                <td className="p-2 text-gray-500">{subj.yearLevel}-{subj.semester}</td>
                                                <td className="p-2 text-center">
                                                    <button type="button" onClick={() => removeSubject(subj.code)} className="text-red-400 hover:text-red-600">
                                                        <X size={14}/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!editingCourse.subjects || editingCourse.subjects.length === 0) && (
                                            <tr><td colSpan={5} className="p-4 text-center text-gray-400 italic">No subjects added.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Subject Inline Form */}
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-3">
                                    <label className="block text-[10px] font-bold text-indigo-800 mb-1">CODE</label>
                                    <input className="w-full p-1.5 border rounded text-xs" placeholder="CS101"
                                        value={tempSubject.code} onChange={e=>setTempSubject({...tempSubject, code: e.target.value})} />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-[10px] font-bold text-indigo-800 mb-1">DESCRIPTION</label>
                                    <input className="w-full p-1.5 border rounded text-xs" placeholder="Intro to Computing"
                                        value={tempSubject.name} onChange={e=>setTempSubject({...tempSubject, name: e.target.value})} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-indigo-800 mb-1">UNITS</label>
                                    <input type="number" className="w-full p-1.5 border rounded text-xs" placeholder="3"
                                        value={tempSubject.units} onChange={e=>setTempSubject({...tempSubject, units: parseInt(e.target.value)})} />
                                </div>
                                <div className="col-span-3 flex gap-1">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-indigo-800 mb-1">YR</label>
                                        <input type="number" className="w-full p-1.5 border rounded text-xs"
                                            value={tempSubject.yearLevel} onChange={e=>setTempSubject({...tempSubject, yearLevel: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-indigo-800 mb-1">SEM</label>
                                        <input type="number" className="w-full p-1.5 border rounded text-xs"
                                            value={tempSubject.semester} onChange={e=>setTempSubject({...tempSubject, semester: parseInt(e.target.value)})} />
                                    </div>
                                    <button type="button" onClick={handleAddSubject} className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700 h-[30px] w-[30px] flex items-center justify-center">
                                        <Plus size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 flex justify-center items-center gap-2">
                            <Save size={18}/> Save Course & Curriculum
                        </button>
                    </form>
                )}
            </Modal>
        </div>
    );
};