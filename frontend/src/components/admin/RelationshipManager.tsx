
import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export const RelationshipManager = () => {
    const [parents, setParents] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudentsForParent, setSelectedStudentsForParent] = useState<string[]>([]);
    const [selectedStudentsForTeacher, setSelectedStudentsForTeacher] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [p, t, s] = await Promise.all([
                api.getUsersByRole('parent'),
                api.getUsersByRole('teacher'),
                api.getUsersByRole('student')
            ]);
            setParents(p.data);
            setTeachers(t.data);
            setStudents(s.data);
        } catch (e) {
            console.error(e);
            setMsg({ type: 'error', text: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkParent = async () => {
        if (!selectedParent || selectedStudentsForParent.length === 0) return;
        try {
            setLoading(true);
            await api.linkParent(selectedParent, selectedStudentsForParent.map(id => parseInt(id)));
            setMsg({ type: 'success', text: 'Parent linked to children successfully' });
            setSelectedStudentsForParent([]);
        } catch (e) {
            setMsg({ type: 'error', text: 'Failed to link parent' });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const handleLinkTeacher = async () => {
        if (!selectedTeacher || selectedStudentsForTeacher.length === 0) return;
        try {
            setLoading(true);
            await api.linkTeacher(selectedTeacher, selectedStudentsForTeacher.map(id => parseInt(id)));
            setMsg({ type: 'success', text: 'Teacher linked to students successfully' });
            setSelectedStudentsForTeacher([]);
        } catch (e) {
            setMsg({ type: 'error', text: 'Failed to link teacher' });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 3000);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {msg && <Alert type={msg.type} onClose={() => setMsg(null)}>{msg.text}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Linking */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        👨‍👩‍👧‍👦 Link Parent to Children
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Parent</label>
                            <select
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                value={selectedParent}
                                onChange={e => setSelectedParent(e.target.value)}
                            >
                                <option value="">Choose a parent...</option>
                                {parents.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Children (Multi-select)</label>
                            <select multiple
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white h-48 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedStudentsForParent}
                                onChange={e => setSelectedStudentsForParent(Array.from(e.target.selectedOptions, option => option.value))}
                            >
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple students.</p>
                        </div>

                        <Button onClick={handleLinkParent} disabled={loading || !selectedParent || selectedStudentsForParent.length === 0} className="w-full">
                            Link Selected Children
                        </Button>
                    </div>
                </div>

                {/* Teacher Linking */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        👨‍🏫 Link Teacher to Students
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Teacher</label>
                            <select
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                value={selectedTeacher}
                                onChange={e => setSelectedTeacher(e.target.value)}
                            >
                                <option value="">Choose a teacher...</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Students (Multi-select)</label>
                            <select multiple
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white h-48 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedStudentsForTeacher}
                                onChange={e => setSelectedStudentsForTeacher(Array.from(e.target.selectedOptions, option => option.value))}
                            >
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple students.</p>
                        </div>
                        <Button onClick={handleLinkTeacher} disabled={loading || !selectedTeacher || selectedStudentsForTeacher.length === 0} className="w-full">
                            Link Selected Students
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
