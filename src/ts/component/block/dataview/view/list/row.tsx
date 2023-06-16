import * as React from 'react';
import $ from 'jquery';
import { observer } from 'mobx-react';
import { I, keyboard, Relation, UtilCommon, UtilObject } from 'Lib';
import { Cell, DropTarget, Icon } from 'Component';
import { dbStore } from 'Store';

interface Props extends I.ViewComponent {
	recordId: string;
	style?: any;
};

const Row = observer(class Row extends React.Component<Props> {

	_isMounted = false;
	node: any = null;

	render () {
		const { rootId, block, recordId, getView, onRef, style, getRecord, onContext, getIdPrefix, isInline, isCollection, onDragRecordStart, onSelectToggle } = this.props;
		const view = getView();
		const relations = view.getVisibleRelations();
		const idPrefix = getIdPrefix();
		const subId = dbStore.getSubId(rootId, block.id);
		const record = getRecord(recordId);
		const cn = [ 'row' ];

		// Subscriptions
		const { hideIcon } = view;
		const { done } = record;

		if ((record.layout == I.ObjectLayout.Task) && done) {
			cn.push('isDone');
		};

		let content = (
			<React.Fragment>
				{relations.map((relation: any, i: number) => {
					const id = Relation.cellId(idPrefix, relation.relationKey, recordId);
					return (
						<Cell
							key={'list-cell-' + relation.relationKey}
							elementId={id}
							ref={ref => onRef(ref, id)}
							{...this.props}
							subId={subId}
							relationKey={relation.relationKey}
							viewType={I.ViewType.List}
							idPrefix={idPrefix}
							onClick={e => this.onCellClick(e, relation)}
							isInline={true}
							showTooltip={true}
							arrayLimit={2}
							iconSize={relation.relationKey == 'name' ? 24 : 18}
						/>
					);
				})}
			</React.Fragment>
		);

		if (!isInline) {
			content = (
				<div
					id={'selectable-' + record.id}
					className={[ 'selectable', 'type-' + I.SelectType.Record ].join(' ')}
					{...UtilCommon.dataProps({ id: record.id, type: I.SelectType.Record })}
				>
					{content}
				</div>
			)
		};

		if (isCollection && !isInline) {
			content = (
				<React.Fragment>
					<Icon
						className="drag"
						draggable={true}
						onClick={e => onSelectToggle(e, record.id)}
						onDragStart={e => onDragRecordStart(e, recordId)}
						onMouseEnter={() => keyboard.setSelectionClearDisabled(true)}
						onMouseLeave={() => keyboard.setSelectionClearDisabled(false)}
					/>
					<DropTarget {...this.props} rootId={rootId} id={record.id} dropType={I.DropType.Record}>
						{content}
					</DropTarget>
				</React.Fragment>
			);
		};

		return (
			<div 
				id={`record-${record.id}`}
				ref={node => this.node = node} 
				className={cn.join(' ')} 
				style={style}
				onClick={e => this.onClick(e)}
				onContextMenu={e => onContext(e, record.id)}
			>
				{content}
			</div>
		);
	};

	componentDidMount () {
		this._isMounted = true;
		this.resize();
	};

	componentDidUpdate () {
		this.resize();
	};

	componentWillUnmount () {
		this._isMounted = false;
	};

	onClick (e: any) {
		e.preventDefault();

		const { onContext, dataset, getRecord, recordId } = this.props;
		const { selection } = dataset || {};
		const record = getRecord(recordId);
		const cb = {
			0: () => {
				keyboard.withCommand(e) ? UtilObject.openWindow(record) : UtilObject.openPopup(record); 
			},
			2: () => { onContext(e, record.id); }
		};

		const ids = selection ? selection.get(I.SelectType.Record) : [];
		if ((keyboard.withCommand(e) && ids.length) || keyboard.isSelectionClearDisabled) {
			return;
		};

		if (cb[e.button]) {
			cb[e.button]();
		};
	};

	onCellClick (e: React.MouseEvent, vr: I.ViewRelation) {
		e.preventDefault();
		e.stopPropagation();

		const { onCellClick, recordId } = this.props;
		const relation = dbStore.getRelationByKey(vr.relationKey);

		if (!relation) {
			return;
		};

		if (![ I.RelationType.Url, I.RelationType.Phone, I.RelationType.Email, I.RelationType.Checkbox ].includes(relation.format)) {
			return;
		};

		onCellClick(e, relation.relationKey, recordId);
	};

	resize () {
		if (!this._isMounted) {
			return;
		};

		const node = $(this.node);
		const first = node.find('.cellContent:not(.isEmpty)').first();

		node.find('.cellContent').removeClass('first');
		if (first.length) {
			first.addClass('first');
		};
	};

});

export default Row;