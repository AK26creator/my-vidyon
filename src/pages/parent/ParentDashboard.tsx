import { useState, useEffect } from 'react';
import { ParentLayout } from '@/layouts/ParentLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/TranslationContext';
import { ChildCard } from '@/components/cards/ChildCard';
import { parentAPI } from '@/services/api';
import { Phone, Shield, School, User, Loader2 } from 'lucide-react';

export function ParentDashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await parentAPI.getDashboard();
                // Map backend data to ChildCard props
                const mappedChildren = data.map((child: any) => ({
                    id: child.id,
                    name: child.name,
                    grade: 'Class 10-A', // Mock until expanded in backend
                    rollNo: '24',       // Mock
                    attendance: child.total_days > 0 ? Math.round((child.present_days / child.total_days) * 100) : 0,
                    performance: 'Good' as const,
                    teacherName: 'Mr. Raman', // Mock
                    teacherPhone: '+91 98765 11111' // Mock
                }));
                setChildren(mappedChildren);
            } catch (error) {
                console.error('Failed to fetch parent dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <ParentLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </ParentLayout>
        );
    }

    return (
        <ParentLayout>
            <PageHeader
                title={`${t.common.welcome}, ${user?.name}!`}
                subtitle={t.parent.dashboard.subtitle}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 mb-8">
                {children.length > 0 ? (
                    children.map((child) => (
                        <ChildCard key={child.id} {...child} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-muted-foreground">No linked student accounts found.</p>
                        <p className="text-xs text-muted-foreground mt-1">Please contact the institution to link your children.</p>
                    </div>
                )}
            </div>

            {/* Emergency Contacts Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-destructive" />
                    Emergency Contacts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* School Office */}
                    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                            <School className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">School Office</p>
                            <a href="tel:+914412345678" className="font-semibold text-foreground hover:text-primary transition-colors block">
                                044-1234 5678
                            </a>
                        </div>
                    </div>

                    {/* Main Guard */}
                    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-2.5 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Main Guard (Security)</p>
                            <a href="tel:+919876500000" className="font-semibold text-foreground hover:text-primary transition-colors block">
                                +91 98765 00000
                            </a>
                        </div>
                    </div>

                    {/* Class Teachers */}
                    {children.slice(0, 2).map((child) => (
                        <div key={child.id} className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-2.5 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">{child.name}'s Teacher</p>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-foreground">{child.teacherName}</span>
                                    <a href={`tel:${child.teacherPhone}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                        {child.teacherPhone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ParentLayout>
    );
}
