export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-gray-600 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  );
}
