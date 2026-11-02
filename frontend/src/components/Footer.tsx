"use client";

type FooterProps = {
  onSaveAction: () => void;
  onCancelAction: () => void;
  onSaveAsNewAction: () => void;
  onApplyAction: () => void;
  onVariantAction: () => void;
  isDefaultPreset: boolean;
  isVariant: boolean;
};

export default function Footer({ onSaveAction, onCancelAction, onSaveAsNewAction, onApplyAction, onVariantAction, isDefaultPreset, isVariant }: FooterProps) {
  return (
    <footer className="app-footer mt-auto py-4 fixed-bottom">
      <div className="container text-center">
        {!isDefaultPreset && <button className="btn btn-primary me-2" onClick={onSaveAction}>
          Save
        </button>}
        <button className="btn btn-success me-2" onClick={onApplyAction}>
          {isDefaultPreset ? "Apply" : "Apply & Save"}
        </button>
        <button className="btn btn-secondary me-2" onClick={onCancelAction}>
          Cancel
        </button>
        {isDefaultPreset && <button className="btn btn-info" onClick={onSaveAsNewAction}>
          Save as New
        </button>}
        {!isDefaultPreset && !isVariant && <button className="btn btn-info" onClick={onVariantAction}>
          Create Variant
        </button>}
      </div>
    </footer>
  );
}
