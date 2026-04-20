/**
 * Editorial Design System — barrel export.
 *
 * Import from a single path in all new pages:
 *
 *   import {
 *     Button, Card, Input, Select, Textarea,
 *     Eyebrow, SectionHeader, StatNumber, Badge,
 *     Spinner, EmptyState, Modal, PageHero,
 *     PublicShell, PublicNavbar, UtilityBar, Footer,
 *     DashboardShell, DashboardTopBar, DashboardSidebar,
 *   } from '../../components/editorial';
 */

/* Primitives */
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input, Select, Textarea } from './Input';
export { default as Eyebrow } from './Eyebrow';
export { default as SectionHeader } from './SectionHeader';
export { default as StatNumber } from './StatNumber';
export { default as Badge } from './Badge';
export { default as Spinner } from './Spinner';
export { default as EmptyState } from './EmptyState';
export { default as Modal } from './Modal';
export { default as PageHero } from './PageHero';

/* Layout pieces */
export { default as UtilityBar } from './layout/UtilityBar';
export { default as PublicNavbar } from './layout/PublicNavbar';
export { default as Footer } from './layout/Footer';
export { default as PublicShell } from './layout/PublicShell';
export { default as DashboardTopBar } from './layout/DashboardTopBar';
export { default as DashboardSidebar } from './layout/DashboardSidebar';
export { default as DashboardShell } from './layout/DashboardShell';
