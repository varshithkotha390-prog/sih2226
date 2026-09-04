import React, { createContext, useContext, useState } from 'react';
import { Recycler, DigitalLot } from '../types';

export interface SellFlowState {
  photoUrl: string | null;
  materialId: string;
  materialName: string;
  materialCategory: string;
  confidence: number;
  weightKg: number;
  marketRatePerKg: number;
  marketEstimate: number;
  selectedRecycler: Recycler | null;
  activeLot: DigitalLot | null;
}

const defaultState: SellFlowState = {
  photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  materialId: 'mat_pcb',
  materialName: 'PCB',
  materialCategory: 'Electronic Component',
  confidence: 94,
  weightKg: 15,
  marketRatePerKg: 125,
  marketEstimate: 1875,
  selectedRecycler: null,
  activeLot: null
};

interface SellFlowContextType {
  state: SellFlowState;
  setPhotoUrl: (url: string) => void;
  setDetectedMaterial: (mat: { id: string; name: string; category: string; confidence: number }) => void;
  setWeightKg: (weight: number) => void;
  setSelectedRecycler: (recycler: Recycler) => void;
  setActiveLot: (lot: DigitalLot) => void;
  resetFlow: () => void;
}

const SellFlowContext = createContext<SellFlowContextType | undefined>(undefined);

export const SellFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SellFlowState>(() => {
    const saved = sessionStorage.getItem('kc_sell_flow');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  const updateState = (updater: (prev: SellFlowState) => SellFlowState) => {
    setState((prev) => {
      const next = updater(prev);
      sessionStorage.setItem('kc_sell_flow', JSON.stringify(next));
      return next;
    });
  };

  const setPhotoUrl = (url: string) => {
    updateState((prev) => ({ ...prev, photoUrl: url }));
  };

  const setDetectedMaterial = (mat: { id: string; name: string; category: string; confidence: number }) => {
    updateState((prev) => {
      const marketRate = mat.id === 'mat_cable' ? 520 : mat.id === 'mat_battery' ? 95 : mat.id === 'mat_lcd' ? 70 : 125;
      const marketEstimate = Math.round(prev.weightKg * marketRate);
      return {
        ...prev,
        materialId: mat.id,
        materialName: mat.name,
        materialCategory: mat.category,
        confidence: mat.confidence,
        marketRatePerKg: marketRate,
        marketEstimate
      };
    });
  };

  const setWeightKg = (weight: number) => {
    updateState((prev) => ({
      ...prev,
      weightKg: weight,
      marketEstimate: Math.round(weight * prev.marketRatePerKg)
    }));
  };

  const setSelectedRecycler = (recycler: Recycler) => {
    updateState((prev) => ({ ...prev, selectedRecycler: recycler }));
  };

  const setActiveLot = (lot: DigitalLot) => {
    updateState((prev) => ({ ...prev, activeLot: lot }));
  };

  const resetFlow = () => {
    sessionStorage.removeItem('kc_sell_flow');
    setState(defaultState);
  };

  return (
    <SellFlowContext.Provider
      value={{
        state,
        setPhotoUrl,
        setDetectedMaterial,
        setWeightKg,
        setSelectedRecycler,
        setActiveLot,
        resetFlow
      }}
    >
      {children}
    </SellFlowContext.Provider>
  );
};

export const useSellFlow = (): SellFlowContextType => {
  const context = useContext(SellFlowContext);
  if (!context) {
    throw new Error('useSellFlow must be used within SellFlowProvider');
  }
  return context;
};
