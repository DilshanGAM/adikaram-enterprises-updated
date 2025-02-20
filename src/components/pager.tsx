"use client";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function Pager({
	pageInfo,
	setPageInfo,
}: {
	pageInfo: any;
	setPageInfo: (pageInfo:any) => void;
}) {
	return (
		<div className="flex items-center justify-center mt-4 space-x-4">
			{/* Previous Button */}
			<Button
				variant="outline"
				onClick={() => setPageInfo({ ...pageInfo, page : pageInfo.page - 1 })}
				disabled={pageInfo.page === 1}
			>
				Previous
			</Button>

			{/* Page Selector */}
			<Select onValueChange={(value) => setPageInfo({ ...pageInfo, page: parseInt(value) })}>
				<SelectTrigger className="w-[150px] text-center">
					<SelectValue placeholder={`Page ${pageInfo.page} of ${pageInfo.totalPages}`} />
				</SelectTrigger>
				<SelectContent>
					{Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map((p) => (
						<SelectItem key={p} value={p.toString()}>
							{p}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Page Display */}
			<span className="text-sm text-gray-700 font-medium">
				{pageInfo.page} of {pageInfo.totalPages}
			</span>

			{/* Next Button */}
			<Button
				variant="outline"
				onClick={() => setPageInfo(
					{ ...pageInfo, page: pageInfo.page
					+ 1 }
				)}
				disabled={pageInfo.page === pageInfo.totalPages||pageInfo.totalPages===0}
			>
				Next
			</Button>
		</div>
	);
}
