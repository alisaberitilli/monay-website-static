import { Prediction } from "#client/utils/gmaps";

const AddressListView: React.FC<Prediction> = ({
  description,
  distance_meters,
  types,
  terms,
  place_id,
  matched_substrings,
  structured_formatting,
}) => {
  return (
    <div className="flex w-full flex-col px-2 py-1">
      <div className="text-sm font-semibold">
        {structured_formatting.main_text}
      </div>
      <div className="text-xs">{structured_formatting.secondary_text}</div>
    </div>
  );
};

export default AddressListView;
